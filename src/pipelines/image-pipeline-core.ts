import { prisma } from "@/lib/prisma";
import { analyzeProductImage, scoreImageQuality, generateAltText, type ProductAnalysis } from "@/lib/ai";
import type { ProductIntakeData } from "@/lib/product-intake";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { runCategoryResearch } from "@/pipelines/tavily";
import { getModulesForRun } from "@/pipelines/modules";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { FIDELITY_RETRY_PREFIX, generateListingImage } from "@/pipelines/image-gen";
import { compositeProductOnScene } from "@/pipelines/composite-fallback";
import { postProcessListingImage } from "@/pipelines/post-process/listing";
import { isListingModuleScaleCritical } from "@/pipelines/modules";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";
import {
  PIPELINE_ERROR,
  sellerErrorFromUnknown,
  toSellerAssetError,
} from "@/lib/pipeline-errors";

function referenceUrls(intake: ProductIntakeData): string[] {
  return (intake.referenceImageUrls ?? []).filter(Boolean);
}

async function loadPipelineStatus(productId: string): Promise<PipelineStatusShape> {
  const row = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { pipelineStatus: true },
  });
  return row.pipelineStatus as unknown as PipelineStatusShape;
}

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

async function generateModuleAsset(params: {
  productId: string;
  userId: string;
  inputImageUrl: string;
  mod: ReturnType<typeof getModulesForRun>[number];
  prompt: string;
  referenceImageUrls: string[];
}) {
  const { productId, userId, inputImageUrl, mod, prompt, referenceImageUrls } = params;
  const scaleCritical = isListingModuleScaleCritical(mod.id);

  let buffer: Buffer;
  if (scaleCritical) {
    buffer = await compositeProductOnScene({
      productImageUrl: inputImageUrl,
      scenePrompt: prompt,
      aspectRatio: "1:1",
      resolution: mod.resolution,
      targetWidth: 1500,
      targetHeight: 1500,
      centerProduct: mod.id === "L1" || mod.id === "L2",
    });
    buffer = await postProcessListingImage(buffer, mod.id);
  } else {
    buffer = await generateListingImage(inputImageUrl, prompt, mod.id, mod.resolution, {
      referenceImageUrls,
      allowFallback: mod.id !== "L1",
    });
  }

  let imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}`);
  let qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);

  if (qaScore < 7 && !scaleCritical) {
    const retryPrompt = `${FIDELITY_RETRY_PREFIX}${prompt}`;
    buffer = await generateListingImage(inputImageUrl, retryPrompt, mod.id, mod.resolution, {
      referenceImageUrls,
      allowFallback: false,
    });
    imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}`);
    qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);
  }

  if (qaScore < 7 && scaleCritical) {
    try {
      buffer = await compositeProductOnScene({
        productImageUrl: inputImageUrl,
        scenePrompt: `${FIDELITY_RETRY_PREFIX}${prompt}`,
        aspectRatio: "1:1",
        resolution: mod.resolution,
        targetWidth: 1500,
        targetHeight: 1500,
        centerProduct: mod.id === "L2",
      });
      buffer = await postProcessListingImage(buffer, mod.id);
      imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}`);
      qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);
    } catch (err) {
      console.warn("[qa] Composite fallback failed:", err);
    }
  }

  return { imageUrl, qaScore, prompt };
}

export type ImagePipelineInput = {
  productId: string;
  /** @deprecated use selectedModules */
  includePackaging?: boolean;
  selectedModules?: import("./modules").ListingModuleId[];
  promptOverrides?: Record<string, string>;
  analysis?: ProductAnalysis;
  intake: ProductIntakeData;
  playbookContext?: string;
  templateContext?: string;
  /** Lock the background style — passed as a description string when bgLocked is true */
  bgLock?: string;
  /** When true, inject background consistency instruction into the prompt */
  bgLocked?: boolean;
};

/** Run the full image pipeline (used by Inngest steps and local dev inline runner). */
export async function runImagePipelineCore(input: ImagePipelineInput): Promise<{ productId: string }> {
  const {
    productId,
    includePackaging,
    selectedModules,
    intake,
    analysis: presetAnalysis,
    promptOverrides = {},
  } = input;
  const playbookContext = input.playbookContext;
  const templateContext = input.templateContext;
  const bgLock = input.bgLock;
  const bgLocked = input.bgLocked;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { user: true },
  });

  const brandProfile = await getBrandProfileForUser(product.userId);
  const modules = getModulesForRun({ includePackaging, selectedModules });
  const extraRefs = referenceUrls(intake);

  const initial: PipelineStatusShape = {
    phase: "RECEIVING",
    steps: modules.map((m) => ({ id: m.id, label: m.label, status: "PENDING" })),
    currentStepIndex: 0,
    startedAt: new Date().toISOString(),
  };
  await savePipelineStatus(productId, initial);

  let pipelineStatus = await loadPipelineStatus(productId);
  pipelineStatus.phase = "ANALYZING";
  await savePipelineStatus(productId, pipelineStatus);

  let analysis: ProductAnalysis;
  if (presetAnalysis) {
    analysis = { ...presetAnalysis, _sourceImageUrl: product.inputImageUrl };
    await prisma.product.update({
      where: { id: productId },
      data: { analysisJson: analysis as object },
    });
  } else {
    const existing = product.analysisJson as ProductAnalysis | null;
    if (existing?.productName && existing._sourceImageUrl === product.inputImageUrl) {
      analysis = existing;
    } else {
      analysis = await analyzeProductImage(product.inputImageUrl);
      await prisma.product.update({
        where: { id: productId },
        data: { analysisJson: analysis as object },
      });
    }
  }

  pipelineStatus = await loadPipelineStatus(productId);
  pipelineStatus.phase = "RESEARCHING";
  await savePipelineStatus(productId, pipelineStatus);

  const research = await runCategoryResearch(intake.name, intake.category);
  await prisma.product.update({
    where: { id: productId },
    data: { researchJson: research as object },
  });

  pipelineStatus = await loadPipelineStatus(productId);
  pipelineStatus.phase = "SELECTING";
  await savePipelineStatus(productId, pipelineStatus);

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    pipelineStatus = await loadPipelineStatus(productId);
    pipelineStatus.phase = "GENERATING";
    pipelineStatus.steps[i].status = "GENERATING";
    pipelineStatus.currentStepIndex = i;
    await savePipelineStatus(productId, pipelineStatus);

    try {
      const prompt =
        promptOverrides[mod.id]?.trim() ||
        buildListingPrompt(mod.id, analysis, intake, research, {
          brandProfile,
          marketplace: product.marketplace,
          playbookContext,
          templateContext,
          bgLock,
          bgLocked,
        });

      const { imageUrl, qaScore } = await generateModuleAsset({
        productId,
        userId: product.userId,
        inputImageUrl: product.inputImageUrl,
        mod,
        prompt,
        referenceImageUrls: extraRefs,
      });

      // Generate alt-text for the generated image
      const altText = await generateAltText(imageUrl, intake.name, mod.id);

      pipelineStatus = await loadPipelineStatus(productId);
      pipelineStatus.steps[i].status = qaScore >= 7 ? "COMPLETE" : "FAILED";
      pipelineStatus.steps[i].imageUrl = imageUrl;
      pipelineStatus.steps[i].qaScore = qaScore;
      pipelineStatus.steps[i].prompt = prompt;

      await prisma.asset.upsert({
        where: { id: `${productId}-${mod.id}` },
        create: {
          id: `${productId}-${mod.id}`,
          productId,
          moduleId: mod.id,
          pipelineType: "LISTING",
          imageUrl,
          status: qaScore >= 7 ? "COMPLETE" : "FAILED",
          qaScore,
          altText,
        },
        update: {
          imageUrl,
          status: qaScore >= 7 ? "COMPLETE" : "FAILED",
          qaScore,
          altText,
          targetWidth: 1500,
          targetHeight: 1500,
          errorMessage: qaScore >= 7 ? null : PIPELINE_ERROR.assetQaFailed,
        },
      });
    } catch (err) {
      const message =
        toSellerAssetError(err instanceof Error ? err.message : PIPELINE_ERROR.assetGenerationFailed) ??
        PIPELINE_ERROR.assetGenerationFailed;
      pipelineStatus = await loadPipelineStatus(productId);
      pipelineStatus.steps[i].status = "FAILED";
      pipelineStatus.steps[i].error = message;
      await prisma.asset.upsert({
        where: { id: `${productId}-${mod.id}` },
        create: {
          id: `${productId}-${mod.id}`,
          productId,
          moduleId: mod.id,
          pipelineType: "LISTING",
          status: "FAILED",
          errorMessage: message,
        },
        update: { status: "FAILED", errorMessage: message },
      });
    }

    await savePipelineStatus(productId, pipelineStatus);
  }

  pipelineStatus = await loadPipelineStatus(productId);
  const anyComplete = pipelineStatus.steps.some((s) => s.status === "COMPLETE");
  const allFailed = pipelineStatus.steps.every((s) => s.status === "FAILED");

  if (allFailed || !anyComplete) {
    pipelineStatus.phase = "FAILED";
    pipelineStatus.error = allFailed
      ? PIPELINE_ERROR.allModulesFailed
      : PIPELINE_ERROR.partialModulesFailed;
  } else {
    pipelineStatus.phase = "COMPLETE";
  }
  pipelineStatus.completedAt = new Date().toISOString();
  await savePipelineStatus(productId, pipelineStatus);

  return { productId };
}

export async function markImagePipelineFailed(productId: string, error: string) {
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
