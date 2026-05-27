import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, IMAGE_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";
import { quoteImageRun } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse, shouldUseInlinePipeline } from "@/lib/inngest-config";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";
import { scheduleInlineImagePipeline } from "@/lib/run-image-pipeline-async";
import { getVisualTemplate, templateContextBlock } from "@/lib/templates/catalog";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { MARKETPLACES } from "@/lib/marketplaces";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    existingProductId,
    inputImageUrl,
    includePackaging = false,
    selectedModules,
    productData,
    marketplace = "AMAZON_US",
    promptOverrides = {},
    analysis,
    templateSlug,
    bgLock,
  } = body as {
    existingProductId?: string;
    inputImageUrl: string;
    includePackaging?: boolean;
    selectedModules?: import("@/pipelines/modules").ListingModuleId[];
    marketplace?: string;
    promptOverrides?: Record<string, string>;
    analysis?: ProductAnalysis;
    productData: ProductIntakeData;
    templateSlug?: string;
    bgLock?: string;
  };

  if (!inputImageUrl || !productData?.name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validMarketplaceIds = new Set(MARKETPLACES.map((m) => m.id));
  if (!validMarketplaceIds.has(marketplace)) {
    return NextResponse.json(
      { error: `Invalid marketplace: ${marketplace}. Valid values: ${[...validMarketplaceIds].join(", ")}` },
      { status: 400 }
    );
  }

  const quote = quoteImageRun({
    includePackaging: Boolean(includePackaging),
    selectedModules,
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
    await prisma.asset.deleteMany({ where: { productId } });
    await prisma.product.update({
      where: { id: productId },
      data: productFields,
    });
  } else {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        pipelineType: "LISTING",
        ...productFields,
      },
    });
    productId = product.id;
  }

  // Deduct credits + dispatch pipeline atomically — either both succeed or both roll back
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: quote.total } },
    });

    const pipelineInput = {
      productId,
      includePackaging,
      selectedModules,
      promptOverrides,
      analysis,
      intake: productData,
      templateContext,
      bgLock,
    };

    if (useInline) {
      // Fire-and-forget inside transaction — does not throw
      scheduleInlineImagePipeline(pipelineInput, session.user.id, quote.total);
    } else {
      await inngest.send({
        name: IMAGE_PIPELINE_EVENT,
        data: {
          ...pipelineInput,
          chargedCredits: quote.total,
        },
      });
    }
  });

  return NextResponse.json({ success: true, productId, creditsCharged: quote.total });
}
