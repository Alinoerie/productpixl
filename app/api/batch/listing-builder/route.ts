import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBrandId } from "@/lib/brands";
import { mapCsvRows, parseCsvText, type CsvColumnMap } from "@/lib/batch/csv";
import { BATCH_MAX_ROWS, type BatchJobItem, type BatchPipelineKind } from "@/lib/batch/types";
import { quoteBatchRun } from "@/lib/credit-pricing";
import { inngest, BATCH_PIPELINE_EVENT } from "@/inngest/client";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { getUserCredits, insufficientCreditsResponse, requireCredits } from "@/lib/require-credits";
import type { ListingModuleId } from "@/pipelines/modules";

type Body = {
  action?: "validate" | "quote" | "run";
  csvText?: string;
  columnMap?: CsvColumnMap;
  brandId?: string;
  marketplace?: string;
  runKind?: BatchPipelineKind;
  includePackaging?: boolean;
  selectedModules?: ListingModuleId[];
  playbookSlug?: string;
  templateSlug?: string;
};

function perItemCredits(total: number, rowCount: number) {
  return Math.max(1, Math.ceil(total / Math.max(1, rowCount)));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  const action = body.action ?? "validate";
  const marketplace = body.marketplace ?? "AMAZON_US";
  const runKind: BatchPipelineKind = body.runKind ?? "both";

  if (!body.csvText?.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }
  if (!body.columnMap?.name || !body.columnMap?.inputImageUrl) {
    return NextResponse.json({ error: "Map product name and image URL columns" }, { status: 400 });
  }

  const parsed = parseCsvText(body.csvText);
  const { rows, errors } = mapCsvRows(parsed.headers, parsed.rows, body.columnMap);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found", errors }, { status: 400 });
  }
  if (rows.length > BATCH_MAX_ROWS) {
    return NextResponse.json(
      { error: `Batch limit is ${BATCH_MAX_ROWS} rows. Split your catalog into smaller files.` },
      { status: 400 }
    );
  }

  const quote = quoteBatchRun({
    rowCount: rows.length,
    kind: runKind,
    marketplace,
    includePackaging: Boolean(body.includePackaging),
    selectedModules: body.selectedModules,
    intake: { name: rows[0]!.name, category: rows[0]!.category ?? "General" },
  });

  if (action === "validate") {
    return NextResponse.json({
      valid: errors.length === 0,
      rowCount: rows.length,
      errors,
      quote,
    });
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Fix CSV errors before continuing", errors }, { status: 400 });
  }

  if (action === "quote") {
    const balance = await getUserCredits(session.user.id);
    return NextResponse.json({
      rowCount: rows.length,
      quote,
      balance,
      canAfford: balance >= quote.total,
      errors,
    });
  }

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const balance = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, balance);
  }

  const brandId = body.brandId ?? (await getActiveBrandId(session.user.id));
  const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: session.user.id } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const batchId = randomUUID();
  const perRowCredits = perItemCredits(quote.total, rows.length);
  const items: BatchJobItem[] = [];

  for (const row of rows) {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        brandId,
        name: row.name,
        inputImageUrl: row.inputImageUrl,
        marketplace: row.marketplace ?? marketplace,
        pipelineType: runKind === "copy" ? "COPY" : "LISTING",
        status: "QUEUED",
        amazonCategory: row.category ?? null,
        materials: row.materials ?? null,
        colors: row.colors ?? null,
        keyFeatures: row.keyFeatures ?? null,
        targetBuyer: row.targetBuyer ?? null,
        competitors: row.competitors ?? null,
        vibe: row.vibe ?? null,
        useCase: row.useCase ?? null,
        differentiators: row.differentiators ?? null,
        dimensions: row.dimensions ?? null,
        playbookSlug: body.playbookSlug ?? null,
        templateSlug: body.templateSlug ?? null,
      },
    });

    items.push({
      productId: product.id,
      kind: runKind,
      marketplace: row.marketplace ?? marketplace,
      includePackaging: Boolean(body.includePackaging),
      selectedModules: body.selectedModules,
      intake: {
        name: row.name,
        brandName: brand.name,
        category: row.category ?? "",
        materials: row.materials,
        colors: row.colors,
        keyFeatures: row.keyFeatures,
        targetBuyer: row.targetBuyer,
        competitors: row.competitors,
        vibe: row.vibe,
        useCase: row.useCase,
        differentiators: row.differentiators,
        dimensions: row.dimensions,
        referenceImageUrls: [],
      },
      chargedCredits: perRowCredits,
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  try {
    await inngest.send({
      name: BATCH_PIPELINE_EVENT,
      data: {
        userId: session.user.id,
        batchId,
        items,
        totalChargedCredits: quote.total,
      },
    });
  } catch (err) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: quote.total } },
    });
    console.error("[batch/listing-builder]", err);
    return NextResponse.json({ error: "Could not start batch job. Credits were refunded." }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    batchId,
    productIds: items.map((i) => i.productId),
    rowCount: rows.length,
    creditsCharged: quote.total,
  });
}
