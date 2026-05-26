import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, IMAGE_PIPELINE_EVENT } from "@/inngest/client";

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
  } = body as {
    existingProductId?: string;
    inputImageUrl: string;
    includePackaging?: boolean;
    marketplace?: string;
    promptOverrides?: Record<string, string>;
    productData: {
      name: string;
      brandName: string;
      category: string;
      dimensions?: string;
      materials?: string;
      colors?: string;
      keyFeatures?: string;
      targetBuyer?: string;
      competitors?: string;
      brandGuidelines?: string;
    };
  };

  if (!inputImageUrl || !productData?.name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.credits < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  let productId = existingProductId;

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
      data: {
        name: productData.name,
        inputImageUrl,
        marketplace,
        status: "QUEUED",
        pipelineStatus: undefined,
        dimensions: productData.dimensions,
        materials: productData.materials,
        colors: productData.colors,
        keyFeatures: productData.keyFeatures,
        targetBuyer: productData.targetBuyer,
        competitors: productData.competitors,
        brandGuidelines: productData.brandGuidelines,
        amazonCategory: productData.category,
      },
    });
  } else {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name: productData.name,
        inputImageUrl,
        pipelineType: "LISTING",
        marketplace,
        status: "QUEUED",
        dimensions: productData.dimensions,
        materials: productData.materials,
        colors: productData.colors,
        keyFeatures: productData.keyFeatures,
        targetBuyer: productData.targetBuyer,
        competitors: productData.competitors,
        brandGuidelines: productData.brandGuidelines,
        amazonCategory: productData.category,
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
      intake: {
        name: productData.name,
        brandName: productData.brandName,
        category: productData.category,
        dimensions: productData.dimensions,
        materials: productData.materials,
        colors: productData.colors,
        keyFeatures: productData.keyFeatures,
        targetBuyer: productData.targetBuyer,
        competitors: productData.competitors,
      },
    },
  });

  return NextResponse.json({ success: true, productId });
}
