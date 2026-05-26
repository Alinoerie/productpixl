import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, COPY_PIPELINE_EVENT } from "@/inngest/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    productId: existingProductId,
    inputImageUrl,
    marketplace = "AMAZON_US",
    productData,
  } = body as {
    productId?: string;
    inputImageUrl?: string;
    marketplace?: string;
    productData: {
      name: string;
      brandName: string;
      category: string;
      materials?: string;
      keyFeatures?: string;
      targetBuyer?: string;
    };
  };

  if (!productData?.name) {
    return NextResponse.json({ error: "Missing product data" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.credits < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  let productId = existingProductId;

  if (!productId) {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name: productData.name,
        inputImageUrl: inputImageUrl || "",
        pipelineType: "COPY",
        status: "QUEUED",
        materials: productData.materials,
        keyFeatures: productData.keyFeatures,
        targetBuyer: productData.targetBuyer,
        amazonCategory: productData.category,
      },
    });
    productId = product.id;
  }

  await prisma.listingCopy.upsert({
    where: { productId },
    create: { productId, marketplace, status: "QUEUED" },
    update: { marketplace, status: "QUEUED" },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: 1 } },
  });

  await inngest.send({
    name: COPY_PIPELINE_EVENT,
    data: {
      productId,
      marketplace,
      intake: {
        name: productData.name,
        brandName: productData.brandName,
        category: productData.category,
        materials: productData.materials,
        keyFeatures: productData.keyFeatures,
        targetBuyer: productData.targetBuyer,
      },
    },
  });

  return NextResponse.json({ success: true, productId });
}
