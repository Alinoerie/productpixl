import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBrandId } from "@/lib/brands";
import { parseCsvText, type CsvColumnMap } from "@/lib/batch/csv";
import { BATCH_MAX_ROWS, type BatchJobItem } from "@/lib/batch/types";
import { quoteBatchRun } from "@/lib/credit-pricing";
import { inngest, BATCH_PIPELINE_EVENT } from "@/inngest/client";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { getUserCredits, insufficientCreditsResponse, requireCredits } from "@/lib/require-credits";
import type { ListingModuleId } from "@/pipelines/modules";

type CopyCsvColumnMap = {
  name: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

type Body = {
  action?: "validate" | "quote" | "run" | "schedule";
  csvText?: string;
  columnMap?: CopyCsvColumnMap;
  brandId?: string;
  marketplace?: string;
  scheduleAt?: string; // ISO 8601 timestamp for scheduling
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

  if (!body.csvText?.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }
  if (!body.columnMap?.name) {
    return NextResponse.json({ error: "Map product name column" }, { status: 400 });
  }

  const parsed = parseCsvText(body.csvText);
  const { rows, errors } = mapCopyCsvRows(parsed.headers, parsed.rows, body.columnMap);

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
    kind: "copy",
    marketplace,
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

  if (action === "schedule") {
    const scheduleAt = body.scheduleAt ? new Date(body.scheduleAt) : null;
    if (!scheduleAt || scheduleAt <= new Date()) {
      return NextResponse.json({ error: "Provide a future runAt time" }, { status: 400 });
    }

    const scheduledJob = await prisma.scheduledBatchJob.create({
      data: {
        userId: session.user.id,
        batchType: "copy",
        status: "SCHEDULED",
        runAt: scheduleAt,
        config: {
          csvText: body.csvText,
          columnMap: body.columnMap,
          marketplace,
          brandId: body.brandId ?? (await getActiveBrandId(session.user.id)),
        },
      },
    });

    return NextResponse.json({
      success: true,
      scheduledJobId: scheduledJob.id,
      runAt: scheduleAt.toISOString(),
      message: `Batch scheduled for ${scheduleAt.toLocaleString()}`,
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
        inputImageUrl: "copy-only",
        marketplace: row.marketplace ?? marketplace,
        pipelineType: "COPY",
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
      },
    });

    items.push({
      productId: product.id,
      kind: "copy",
      marketplace: row.marketplace ?? marketplace,
      selectedModules: [] as ListingModuleId[],
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
    console.error("[batch/copy]", err);
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

type CopyRow = {
  name: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

function cellValue(row: string[], headers: string[], column?: string): string | undefined {
  if (!column) return undefined;
  const index = headers.indexOf(column);
  if (index < 0) return undefined;
  return row[index] || undefined;
}

function mapCopyCsvRows(
  headers: string[],
  rows: string[][],
  columnMap: CopyCsvColumnMap
): { rows: CopyRow[]; errors: string[] } {
  const errors: string[] = [];
  const mapped: CopyRow[] = [];

  rows.forEach((row, index) => {
    const lineNum = index + 2;
    const name = cellValue(row, headers, columnMap.name);

    if (!name) {
      errors.push(`Row ${lineNum}: product name is required`);
      return;
    }

    mapped.push({
      name,
      category: cellValue(row, headers, columnMap.category),
      marketplace: cellValue(row, headers, columnMap.marketplace),
      materials: cellValue(row, headers, columnMap.materials),
      colors: cellValue(row, headers, columnMap.colors),
      keyFeatures: cellValue(row, headers, columnMap.keyFeatures),
      targetBuyer: cellValue(row, headers, columnMap.targetBuyer),
      competitors: cellValue(row, headers, columnMap.competitors),
      vibe: cellValue(row, headers, columnMap.vibe),
      useCase: cellValue(row, headers, columnMap.useCase),
      differentiators: cellValue(row, headers, columnMap.differentiators),
      dimensions: cellValue(row, headers, columnMap.dimensions),
    });
  });

  return { rows: mapped, errors };
}
