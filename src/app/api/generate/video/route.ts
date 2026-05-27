import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quoteVideoRun } from "@/lib/credit-pricing";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";

/** Beta video generation — queues project and returns pipeline id. Full render pipeline ships later. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const body = await req.json();
  const {
    inputImageUrl,
    format = "reels_9_16",
    motionStyle = "slow_pan",
    musicEnabled = false,
    musicGenre = "ambient",
    productName = "Product video",
  } = body as {
    inputImageUrl?: string;
    format?: string;
    motionStyle?: string;
    musicEnabled?: boolean;
    musicGenre?: string;
    productName?: string;
  };

  if (!inputImageUrl) {
    return NextResponse.json({ error: "Product image is required" }, { status: 400 });
  }

  const formatCredits = format === "amazon_16_9" ? 95 : format === "tiktok_9_16" ? 85 : 80;
  const quote = quoteVideoRun({ formatCredits, musicEnabled });
  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  const product = await prisma.product.create({
    data: {
      userId: session.user.id,
      name: productName,
      inputImageUrl,
      pipelineType: "VIDEO",
      status: "QUEUED",
      analysisJson: {
        videoBeta: true,
        format,
        motionStyle,
        musicEnabled,
        musicGenre,
        queuedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quote.total } },
  });

  return NextResponse.json({
    success: true,
    productId: product.id,
    status: "QUEUED",
    message: "Video beta — your reel is queued. We'll notify you when rendering is available.",
    creditsCharged: quote.total,
  });
}
