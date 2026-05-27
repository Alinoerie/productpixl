import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest, COPY_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import { quoteCopyRun, quoteCopyRunMulti } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse, shouldUseInlinePipeline } from "@/lib/inngest-config";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";
import { scheduleInlineCopyPipeline } from "@/lib/run-copy-pipeline-async";
import { runCopyPipelineMulti } from "@/pipelines/copy-pipeline-core";
import { listingCopyWhere } from "@/lib/listing-copy";
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
    marketplaces,
    productData,
    playbookContext,
  } = body as {
    productId?: string;
    inputImageUrl?: string;
    marketplace?: string;
    marketplaces?: string[];
    productData: ProductIntakeData;
    playbookContext?: string;
  };

  if (!productData?.name || !productData?.category) {
    return NextResponse.json({ error: "Product name and category are required" }, { status: 400 });
  }

  const targetMarketplaces = [...new Set((marketplaces?.length ? marketplaces : [marketplace]).filter(Boolean))];
  const quote =
    targetMarketplaces.length > 1
      ? quoteCopyRunMulti({ marketplaces: targetMarketplaces, intake: productData })
      : quoteCopyRun({ marketplace: targetMarketplaces[0]!, intake: productData });

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  let productId = existingProductId;
  const primaryMarketplace = targetMarketplaces[0]!;

  const productFields = {
    name: productData.name,
    inputImageUrl: inputImageUrl || "",
    marketplace: primaryMarketplace,
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

  for (const mp of targetMarketplaces) {
    await prisma.listingCopy.upsert({
      where: listingCopyWhere(productId, mp),
      create: { productId, marketplace: mp, status: "QUEUED" },
      update: { status: "QUEUED", errorMessage: null },
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  const useInline = shouldUseInlinePipeline();

  try {
    if (targetMarketplaces.length > 1) {
      if (useInline) {
        void (async () => {
          try {
            await runCopyPipelineMulti({
              productId,
              marketplaces: targetMarketplaces,
              intake: productData,
              playbooksContext: playbookContext,
            });
          } catch (err) {
            console.error("[inline-copy-multi]", err);
            const { prisma: db } = await import("@/lib/prisma");
            await db.user.update({
              where: { id: session.user!.id },
              data: { credits: { increment: quote.total } },
            });
          }
        })();
      } else {
        await inngest.send({
          name: COPY_PIPELINE_EVENT,
          data: {
            productId,
            marketplaces: targetMarketplaces,
            intake: productData,
            playbooksContext: playbookContext,
            chargedCredits: quote.total,
          },
        });
      }
    } else {
      const pipelineInput = {
        productId,
        marketplace: primaryMarketplace,
        intake: productData,
        playbooksContext: playbookContext,
      };

      if (useInline) {
        scheduleInlineCopyPipeline(pipelineInput, session.user.id, quote.total);
      } else {
        await inngest.send({
          name: COPY_PIPELINE_EVENT,
          data: {
            ...pipelineInput,
            chargedCredits: quote.total,
          },
        });
      }
    }
  } catch (err) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: quote.total } },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { status: "FAILED" },
    });
    for (const mp of targetMarketplaces) {
      await prisma.listingCopy.update({
        where: listingCopyWhere(productId, mp),
        data: {
          status: "FAILED",
          errorMessage: err instanceof Error ? err.message : PIPELINE_ERROR.generationFailed,
        },
      });
    }
    console.error("[generate/copy] inngest.send failed:", err);
    return NextResponse.json(
      { error: "Could not start copy generation. Credits were not charged." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    productId,
    marketplaces: targetMarketplaces,
    creditsCharged: quote.total,
  });
}
