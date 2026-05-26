import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, COPY_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import { quoteCopyRun } from "@/lib/credit-pricing";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";

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
    productData: ProductIntakeData;
  };

  if (!productData?.name || !productData?.category) {
    return NextResponse.json({ error: "Product name and category are required" }, { status: 400 });
  }

  const quote = quoteCopyRun({ marketplace, intake: productData });
  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  let productId = existingProductId;

  const productFields = {
    name: productData.name,
    inputImageUrl: inputImageUrl || "",
    marketplace,
    status: "QUEUED" as const,
    materials: productData.materials,
    keyFeatures: productData.keyFeatures,
    targetBuyer: productData.targetBuyer,
    competitors: productData.competitors,
    vibe: productData.vibe,
    useCase: productData.useCase,
    differentiators: productData.differentiators,
    referenceImageUrls: productData.referenceImageUrls ?? [],
    amazonCategory: productData.category,
  };

  if (productId) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    await prisma.product.update({
      where: { id: productId },
      data: productFields,
    });
  } else {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        pipelineType: "COPY",
        ...productFields,
      },
    });
    productId = product.id;
  }

  await prisma.listingCopy.upsert({
    where: { productId },
    create: { productId, marketplace, status: "QUEUED" },
    update: { marketplace, status: "QUEUED", errorMessage: null },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  await inngest.send({
    name: COPY_PIPELINE_EVENT,
    data: {
      productId,
      marketplace,
      intake: productData,
      chargedCredits: quote.total,
    },
  });

  return NextResponse.json({ success: true, productId, creditsCharged: quote.total });
}
