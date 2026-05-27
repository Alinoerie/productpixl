import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { primaryListingCopy } from "@/lib/listing-copy";
import { quoteBatchRun } from "@/lib/credit-pricing";
import { inngest, BATCH_PIPELINE_EVENT } from "@/inngest/client";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { getUserCredits, insufficientCreditsResponse, requireCredits } from "@/lib/require-credits";
import type { BatchJobItem, BatchPipelineKind, CloneVariation } from "@/lib/batch/types";
import { BATCH_MAX_ROWS } from "@/lib/batch/types";
import { intakeFromProduct } from "@/lib/credit-pricing";

type Body = {
  action?: "quote" | "run";
  sourceProductId?: string;
  variations?: CloneVariation[];
  runKind?: BatchPipelineKind;
  cloneListingCopy?: boolean;
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
  const action = body.action ?? "quote";
  const runKind: BatchPipelineKind = body.runKind ?? "both";

  if (!body.sourceProductId) {
    return NextResponse.json({ error: "sourceProductId is required" }, { status: 400 });
  }

  const source = await prisma.product.findFirst({
    where: { id: body.sourceProductId, userId: session.user.id },
    include: { assets: true, listingCopies: true },
  });
  if (!source) {
    return NextResponse.json({ error: "Source project not found" }, { status: 404 });
  }

  const variations = body.variations?.filter((v) => v.name?.trim()) ?? [];
  if (variations.length === 0) {
    return NextResponse.json({ error: "Add at least one variation" }, { status: 400 });
  }
  if (variations.length > BATCH_MAX_ROWS) {
    return NextResponse.json(
      { error: `Clone limit is ${BATCH_MAX_ROWS} variations per run` },
      { status: 400 }
    );
  }

  const sourceCopy = primaryListingCopy(source.listingCopies, source.marketplace);
  const baseIntake = intakeFromProduct({
    ...source,
    referenceImageUrls: source.referenceImageUrls as string[] | null,
  });

  const quote = quoteBatchRun({
    rowCount: variations.length,
    kind: runKind,
    marketplace: source.marketplace,
    intake: baseIntake,
  });

  if (action === "quote") {
    const balance = await getUserCredits(session.user.id);
    return NextResponse.json({
      variationCount: variations.length,
      quote,
      balance,
      canAfford: balance >= quote.total,
      hasSourceCopy: Boolean(sourceCopy?.title),
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

  const batchId = randomUUID();
  const perRowCredits = perItemCredits(quote.total, variations.length);
  const items: BatchJobItem[] = [];

  for (const variation of variations) {
    const marketplace = variation.marketplace ?? source.marketplace;
    const clone = await prisma.product.create({
      data: {
        userId: session.user.id,
        brandId: source.brandId,
        name: variation.name.trim(),
        inputImageUrl: source.inputImageUrl,
        marketplace,
        pipelineType: source.pipelineType,
        status: runKind === "copy" ? "QUEUED" : source.status,
        amazonCategory: source.amazonCategory,
        materials: variation.materials ?? source.materials,
        colors: variation.colors ?? source.colors,
        keyFeatures: variation.keyFeatures ?? source.keyFeatures,
        targetBuyer: source.targetBuyer,
        competitors: source.competitors,
        vibe: source.vibe,
        useCase: source.useCase,
        differentiators: source.differentiators,
        dimensions: source.dimensions,
        weight: source.weight,
        brandGuidelines: source.brandGuidelines,
        brandRegistered: source.brandRegistered,
        referenceImageUrls: source.referenceImageUrls ?? [],
        analysisJson: source.analysisJson ?? undefined,
        researchJson: source.researchJson ?? undefined,
        playbookSlug: source.playbookSlug,
        templateSlug: source.templateSlug,
      },
    });

    if (body.cloneListingCopy && sourceCopy?.title && runKind !== "image") {
      await prisma.listingCopy.create({
        data: {
          productId: clone.id,
          marketplace,
          status: "COMPLETE",
          title: sourceCopy.title,
          bullets: sourceCopy.bullets ?? undefined,
          description: sourceCopy.description,
          backendKeywords: sourceCopy.backendKeywords,
        },
      });
    }

    if (runKind !== "copy" && source.assets.some((a) => a.imageUrl)) {
      await prisma.asset.createMany({
        data: source.assets
          .filter((a) => a.imageUrl)
          .map((a) => ({
            productId: clone.id,
            moduleId: a.moduleId,
            pipelineType: a.pipelineType,
            imageUrl: a.imageUrl,
            videoUrl: a.videoUrl,
            targetWidth: a.targetWidth,
            targetHeight: a.targetHeight,
            status: a.status,
            qaScore: a.qaScore,
          })),
      });
    }

    const needsPipeline = runKind === "copy" || runKind === "both" || runKind === "image";
    if (needsPipeline && (runKind !== "copy" || !body.cloneListingCopy)) {
      items.push({
        productId: clone.id,
        kind: runKind,
        marketplace,
        intake: {
          ...baseIntake,
          name: variation.name.trim(),
          colors: variation.colors ?? baseIntake.colors,
          materials: variation.materials ?? baseIntake.materials,
          keyFeatures: variation.keyFeatures ?? baseIntake.keyFeatures,
        },
        chargedCredits: perRowCredits,
      });
    } else if (runKind === "copy" && body.cloneListingCopy && !sourceCopy?.title) {
      items.push({
        productId: clone.id,
        kind: "copy",
        marketplace,
        intake: {
          ...baseIntake,
          name: variation.name.trim(),
          colors: variation.colors ?? baseIntake.colors,
        },
        chargedCredits: perRowCredits,
      });
    }
  }

  if (items.length > 0) {
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
      console.error("[batch/clone]", err);
      return NextResponse.json({ error: "Could not queue clone batch. Credits were refunded." }, { status: 503 });
    }
  }

  return NextResponse.json({
    success: true,
    batchId,
    clonedCount: variations.length,
    queuedCount: items.length,
    creditsCharged: items.length > 0 ? quote.total : 0,
  });
}
