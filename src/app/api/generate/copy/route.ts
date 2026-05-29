import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { inngest, COPY_PIPELINE_EVENT } from "@/inngest/client";
import type { ProductIntakeData } from "@/lib/product-intake";
import { quoteCopyRun, quoteCopyRunMulti } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse, shouldUseInlinePipeline } from "@/lib/inngest-config";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";
import { scheduleInlineCopyPipeline } from "@/lib/run-copy-pipeline-async";
import { runCopyPipelineMulti } from "@/pipelines/copy-pipeline-core";
import { listingCopyWhere } from "@/lib/listing-copy";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { MARKETPLACES } from "@/lib/marketplaces";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`generate:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
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

  const validMarketplaceIds = new Set<string>(MARKETPLACES.map((m) => m.id));
  const targetMarketplaces = [...new Set((marketplaces?.length ? marketplaces : [marketplace]).filter(Boolean))];
  const invalidMp = targetMarketplaces.find((mp) => !validMarketplaceIds.has(mp));
  if (invalidMp) {
    return NextResponse.json(
      { error: `Invalid marketplace: ${invalidMp}. Valid values: ${[...validMarketplaceIds].join(", ")}` },
      { status: 400 }
    );
  }

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

  const useInline = shouldUseInlinePipeline();

  // Deduct credits + dispatch pipeline atomically
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: quote.total } },
    });

    if (useInline) {
      if (targetMarketplaces.length > 1) {
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
          }
        })();
      } else {
        scheduleInlineCopyPipeline(
          {
            productId,
            marketplace: primaryMarketplace,
            intake: productData,
            playbooksContext: playbookContext,
          },
          session.user.id,
          quote.total
        );
      }
    } else {
      await inngest.send({
        name: COPY_PIPELINE_EVENT,
        data: {
          productId,
          ...(targetMarketplaces.length > 1
            ? { marketplaces: targetMarketplaces }
            : { marketplace: primaryMarketplace }),
          intake: productData,
          playbooksContext: playbookContext,
          chargedCredits: quote.total,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    productId,
    marketplaces: targetMarketplaces,
    creditsCharged: quote.total,
  });
}
