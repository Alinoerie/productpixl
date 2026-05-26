import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, IMAGE_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";
import { quoteImageRun } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";

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
    productData,
    marketplace = "AMAZON_US",
    promptOverrides = {},
    analysis,
  } = body as {
    existingProductId?: string;
    inputImageUrl: string;
    includePackaging?: boolean;
    marketplace?: string;
    promptOverrides?: Record<string, string>;
    analysis?: ProductAnalysis;
    productData: ProductIntakeData;
  };

  if (!inputImageUrl || !productData?.name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const quote = quoteImageRun({
    includePackaging: Boolean(includePackaging),
    marketplace,
    intake: productData,
  });

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  let productId = existingProductId;
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

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  try {
    await inngest.send({
      name: IMAGE_PIPELINE_EVENT,
      data: {
        productId,
        includePackaging,
        promptOverrides,
        analysis,
        intake: productData,
        chargedCredits: quote.total,
      },
    });
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
          error: err instanceof Error ? err.message : "Failed to start background job",
          steps: [],
          currentStepIndex: 0,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      },
    });
    console.error("[generate/images] inngest.send failed:", err);
    return NextResponse.json(
      { error: "Could not start generation. Credits were not charged." },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, productId, creditsCharged: quote.total });
}
