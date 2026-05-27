import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, APLUS_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";
import { quoteAplusRun } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse, shouldUseInlinePipeline } from "@/lib/inngest-config";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";
import { scheduleInlineAplusPipeline } from "@/lib/run-aplus-pipeline-async";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { getVisualTemplate, templateContextBlock } from "@/lib/templates/catalog";
import { getBrandProfileForUser } from "@/lib/brand-profile";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    existingProductId,
    inputImageUrl,
    selectedModules,
    brandRegistered = false,
    productData,
    marketplace = "AMAZON_US",
    promptOverrides = {},
    analysis,
    templateSlug,
    playbookContext,
  } = body as {
    existingProductId?: string;
    inputImageUrl: string;
    selectedModules?: import("@/pipelines/aplus-modules").AplusModuleId[];
    brandRegistered?: boolean;
    marketplace?: string;
    promptOverrides?: Record<string, string>;
    analysis?: ProductAnalysis;
    productData: ProductIntakeData;
    templateSlug?: string;
    playbookContext?: string;
  };

  if (!inputImageUrl || !productData?.name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const quote = quoteAplusRun({
    selectedModules,
    brandRegistered: Boolean(brandRegistered),
    marketplace,
    intake: productData,
  });

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const useInline = shouldUseInlinePipeline();

  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  let productId = existingProductId;
  const brandProfile = await getBrandProfileForUser(session.user.id);
  const template = templateSlug ? getVisualTemplate(templateSlug) : undefined;
  const templateContext = template
    ? templateContextBlock(template, productData.brandName || brandProfile.displayName || "")
    : undefined;

  const productFields = {
    name: productData.name,
    inputImageUrl,
    marketplace,
    brandRegistered: Boolean(brandRegistered),
    status: "QUEUED",
    dimensions: productData.dimensions,
    materials: productData.materials,
    colors: productData.colors,
    keyFeatures: productData.keyFeatures,
    targetBuyer: productData.targetBuyer,
    competitors: productData.competitors,
    vibe: productData.vibe,
    useCase: productData.useCase,
    differentiators: productData.differentiators,
    referenceImageUrls: productData.referenceImageUrls ?? [],
    amazonCategory: productData.category,
    templateSlug: templateSlug ?? undefined,
    analysisJson: analysis ? (analysis as object) : undefined,
  };

  if (productId) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    await prisma.asset.deleteMany({ where: { productId, pipelineType: "APLUS" } });
    await prisma.product.update({
      where: { id: productId },
      data: productFields,
    });
  } else {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        pipelineType: "APLUS",
        ...productFields,
      },
    });
    productId = product.id;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  try {
    const pipelineInput = {
      productId,
      selectedModules,
      brandRegistered: Boolean(brandRegistered),
      promptOverrides,
      analysis,
      intake: productData,
      playbookContext,
      templateContext,
    };

    if (useInline) {
      scheduleInlineAplusPipeline(pipelineInput, session.user.id, quote.total);
    } else {
      await inngest.send({
        name: APLUS_PIPELINE_EVENT,
        data: {
          ...pipelineInput,
          chargedCredits: quote.total,
        },
      });
    }
  } catch (err) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: quote.total } },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "FAILED",
        pipelineStatus: {
          phase: "FAILED",
          error: err instanceof Error ? err.message : PIPELINE_ERROR.generationFailed,
          steps: [],
          currentStepIndex: 0,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      },
    });
    console.error("[generate/aplus] inngest.send failed:", err);
    return NextResponse.json(
      { error: "Could not start generation. Credits were not charged." },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, productId, creditsCharged: quote.total });
}
