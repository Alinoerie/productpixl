import Replicate from "replicate";
import { prisma } from "@/lib/prisma";
import { uploadVideoUrlToCloudinary } from "@/lib/cloudinary";
import { isStubMode, sleep } from "@/lib/utils";
import { extractReplicateUrl } from "@/lib/replicate-output";
import {
  getVideoFormat,
  MOTION_STYLE_PROMPTS,
  normalizeVideoFormatId,
} from "@/lib/video-formats";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";
import { PIPELINE_ERROR, sellerErrorFromUnknown } from "@/lib/pipeline-errors";

export type VideoPipelineInput = {
  productId: string;
  inputImageUrl: string;
  format?: string;
  motionStyle?: string;
  musicEnabled?: boolean;
};

async function savePipelineStatus(productId: string, status: PipelineStatusShape) {
  await prisma.product.update({
    where: { id: productId },
    data: {
      pipelineStatus: status as object,
      status:
        status.phase === "COMPLETE"
          ? "COMPLETE"
          : status.phase === "FAILED"
            ? "FAILED"
            : "PROCESSING",
    },
  });
}

async function generateVideoFromImage(inputImageUrl: string, prompt: string): Promise<string> {
  if (isStubMode()) {
    await sleep(2000);
    return inputImageUrl;
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const output = await replicate.run("minimax/video-01-live", {
    input: {
      prompt,
      first_frame_image: inputImageUrl,
    },
  });
  const url = extractReplicateUrl(output);
  if (!url) throw new Error("Video generation returned no URL");
  return url;
}

export async function runVideoPipelineCore(input: VideoPipelineInput): Promise<{ productId: string }> {
  const { productId, inputImageUrl } = input;
  const format = getVideoFormat(normalizeVideoFormatId(input.format ?? "reels_9_16"));
  const motion =
    MOTION_STYLE_PROMPTS[input.motionStyle ?? "reveal"] ?? MOTION_STYLE_PROMPTS.reveal;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { user: true },
  });

  const initial: PipelineStatusShape = {
    phase: "GENERATING",
    steps: [{ id: "VIDEO", label: "Product video", status: "GENERATING" }],
    currentStepIndex: 0,
    startedAt: new Date().toISOString(),
  };
  await savePipelineStatus(productId, initial);

  const prompt = `Product video for ecommerce listing. ${format.label}, ${format.ratio}, ${format.duration}. Motion: ${motion}. Keep product identity faithful to reference frame. No text overlays.`;

  try {
    const rawVideoUrl = await generateVideoFromImage(inputImageUrl, prompt);
    const videoUrl = await uploadVideoUrlToCloudinary(
      rawVideoUrl,
      `productpixl/${product.userId}/${productId}/video`
    );

    await prisma.asset.upsert({
      where: { id: `${productId}-VIDEO` },
      create: {
        id: `${productId}-VIDEO`,
        productId,
        moduleId: "VIDEO",
        pipelineType: "VIDEO",
        videoUrl,
        status: "COMPLETE",
        targetWidth: format.width,
        targetHeight: format.height,
      },
      update: {
        videoUrl,
        status: "COMPLETE",
        pipelineType: "VIDEO",
        targetWidth: format.width,
        targetHeight: format.height,
        errorMessage: null,
      },
    });

    const complete: PipelineStatusShape = {
      phase: "COMPLETE",
      steps: [{ id: "VIDEO", label: "Product video", status: "COMPLETE", imageUrl: videoUrl }],
      currentStepIndex: 0,
      startedAt: initial.startedAt,
      completedAt: new Date().toISOString(),
    };
    await savePipelineStatus(productId, complete);
  } catch (err) {
    const message = sellerErrorFromUnknown(err, PIPELINE_ERROR.generationFailed);
    await prisma.asset.upsert({
      where: { id: `${productId}-VIDEO` },
      create: {
        id: `${productId}-VIDEO`,
        productId,
        moduleId: "VIDEO",
        pipelineType: "VIDEO",
        status: "FAILED",
        errorMessage: message,
      },
      update: { status: "FAILED", errorMessage: message },
    });
    await savePipelineStatus(productId, {
      phase: "FAILED",
      error: message,
      steps: [{ id: "VIDEO", label: "Product video", status: "FAILED", error: message }],
      currentStepIndex: 0,
      startedAt: initial.startedAt,
      completedAt: new Date().toISOString(),
    });
    throw err;
  }

  return { productId };
}

export async function markVideoPipelineFailed(productId: string, error: string) {
  const sellerError = sellerErrorFromUnknown(error, PIPELINE_ERROR.generationFailed);
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "FAILED",
      pipelineStatus: {
        phase: "FAILED",
        error: sellerError,
        steps: [],
        currentStepIndex: 0,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    },
  });
}
