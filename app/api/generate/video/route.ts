import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { inngest, VIDEO_PIPELINE_EVENT } from "@/inngest/client";
import { quoteVideoRun } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse, shouldUseInlinePipeline } from "@/lib/inngest-config";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { formatCreditsForVideo, normalizeVideoFormatId } from "@/lib/video-formats";
import { scheduleInlineVideoPipeline } from "@/lib/run-video-pipeline-async";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";

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

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const body = await req.json();
  const {
    inputImageUrl,
    format = "reels_9_16",
    motionStyle = "reveal",
    musicEnabled = false,
    productName = "Product video",
    existingProductId,
  } = body as {
    inputImageUrl?: string;
    format?: string;
    motionStyle?: string;
    musicEnabled?: boolean;
    productName?: string;
    existingProductId?: string;
  };

  if (!inputImageUrl) {
    return NextResponse.json({ error: "Product image is required" }, { status: 400 });
  }

  const normalizedFormat = normalizeVideoFormatId(format);
  const formatCredits = formatCreditsForVideo(normalizedFormat);
  const quote = quoteVideoRun({ formatCredits, musicEnabled: Boolean(musicEnabled) });
  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  let productId = existingProductId;
  if (productId) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    await prisma.product.update({
      where: { id: productId },
      data: {
        inputImageUrl,
        name: productName,
        pipelineType: "VIDEO",
        status: "QUEUED",
        analysisJson: {
          videoFormat: normalizedFormat,
          motionStyle,
          musicEnabled,
          queuedAt: new Date().toISOString(),
        },
      },
    });
    await prisma.asset.deleteMany({ where: { productId, pipelineType: "VIDEO" } });
  } else {
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name: productName,
        inputImageUrl,
        pipelineType: "VIDEO",
        status: "QUEUED",
        analysisJson: {
          videoFormat: normalizedFormat,
          motionStyle,
          musicEnabled,
          queuedAt: new Date().toISOString(),
        },
      },
    });
    productId = product.id;
  }

  const useInline = shouldUseInlinePipeline();
  const pipelineInput = {
    productId,
    inputImageUrl,
    format: normalizedFormat,
    motionStyle,
    musicEnabled: Boolean(musicEnabled),
  };

  // Deduct credits + dispatch pipeline atomically
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: quote.total } },
    });

    if (useInline) {
      scheduleInlineVideoPipeline(pipelineInput, session.user.id, quote.total);
    } else {
      await inngest.send({
        name: VIDEO_PIPELINE_EVENT,
        data: { ...pipelineInput, chargedCredits: quote.total },
      });
    }
  });

  return NextResponse.json({
    success: true,
    productId,
    status: "QUEUED",
    message: "Video generation started — preview will appear when rendering completes.",
    creditsCharged: quote.total,
  });
}
