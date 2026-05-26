import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, IMAGE_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";

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

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.credits < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
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
    data: { credits: { decrement: 1 } },
  });

  await inngest.send({
    name: IMAGE_PIPELINE_EVENT,
    data: {
      productId,
      includePackaging,
      promptOverrides,
      analysis,
      intake: productData,
    },
  });

  return NextResponse.json({ success: true, productId });
}
