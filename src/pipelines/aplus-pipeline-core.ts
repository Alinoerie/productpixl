import { prisma } from "@/lib/prisma";
import { analyzeProductImage, scoreImageQuality, type ProductAnalysis } from "@/lib/ai";
import type { ProductIntakeData } from "@/lib/product-intake";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { runCategoryResearch } from "@/pipelines/tavily";
import {
  getModulesForRun,
  isAplusModuleScaleCritical,
  type AplusModuleId,
} from "@/pipelines/aplus-modules";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { buildAplusPrompt } from "@/pipelines/aplus-prompt-builder";
import { FIDELITY_RETRY_PREFIX, generateAplusImage } from "@/pipelines/image-gen";
import { compositeProductOnScene } from "@/pipelines/composite-fallback";
import { postProcessAplusImage } from "@/pipelines/post-process/aplus";
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
  const scaleCritical = isAplusModuleScaleCritical(mod.id);
  const postSpec = {
    width: mod.targetWidth,
    height: mod.targetHeight,
    cropHeight: mod.cropHeight,
  };

  let buffer: Buffer;
  if (scaleCritical) {
    buffer = await compositeProductOnScene({
      productImageUrl: inputImageUrl,
      scenePrompt: prompt,
      aspectRatio: mod.aspectRatio,
      resolution: mod.resolution,
      targetWidth: mod.targetWidth,
      targetHeight: mod.targetHeight,
      centerProduct: mod.id !== "M7" && mod.id !== "M12" && mod.id !== "M13" && mod.id !== "M15",
    });
    buffer = await postProcessAplusImage(buffer, postSpec);
  } else {
    buffer = await generateAplusImage(inputImageUrl, prompt, mod.aspectRatio, mod.resolution, {
      referenceImageUrls,
      allowFallback: true,
    });
    buffer = await postProcessAplusImage(buffer, postSpec);
  }

  let imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}/aplus`);
  let qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);

  if (qaScore < 7 && !scaleCritical) {
    const retryPrompt = `${FIDELITY_RETRY_PREFIX}${prompt}`;
    buffer = await generateAplusImage(inputImageUrl, retryPrompt, mod.aspectRatio, mod.resolution, {
      referenceImageUrls,
      allowFallback: false,
    });
    buffer = await postProcessAplusImage(buffer, postSpec);
    imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}/aplus`);
    qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);
  }

  if (qaScore < 7 && scaleCritical) {
    try {
      buffer = await compositeProductOnScene({
        productImageUrl: inputImageUrl,
        scenePrompt: `${FIDELITY_RETRY_PREFIX}${prompt}`,
        aspectRatio: mod.aspectRatio,
        resolution: mod.resolution,
        targetWidth: mod.targetWidth,
        targetHeight: mod.targetHeight,
        centerProduct: mod.id === "M1" || mod.id === "M4" || mod.id === "M6" || mod.id === "M9",
      });
      buffer = await postProcessAplusImage(buffer, postSpec);
      imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}/aplus`);
      qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);
    } catch {
      /* keep prior attempt scores */
    }
  }

  return { imageUrl, qaScore, prompt };
}

export type AplusPipelineInput = {
  productId: string;
  selectedModules?: AplusModuleId[];
  brandRegistered?: boolean;
  promptOverrides?: Record<string, string>;
  analysis?: ProductAnalysis;
  intake: ProductIntakeData;
  playbookContext?: string;
  templateContext?: string;
};

/** Run the full A+ pipeline (used by Inngest steps and local dev inline runner). */
export async function runAplusPipelineCore(input: AplusPipelineInput): Promise<{ productId: string }> {
  const {
    productId,
    selectedModules,
    brandRegistered = false,
    intake,
    analysis: analysisPreset,
    promptOverrides = {},
    playbookContext,
    templateContext,
  } = input;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { user: true },
  });

  const brandProfile = await getBrandProfileForUser(product.userId);
  const registered = brandRegistered || product.brandRegistered;
  const modules = getModulesForRun({ selectedModules, brandRegistered: registered });
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
  if (analysisPreset) {
    analysis = { ...analysisPreset, _sourceImageUrl: product.inputImageUrl };
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
        buildAplusPrompt(mod.id, analysis, intake, research, {
          brandProfile,
          marketplace: product.marketplace,
          playbookContext,
          templateContext,
        });

      const { imageUrl, qaScore } = await generateModuleAsset({
        productId,
        userId: product.userId,
        inputImageUrl: product.inputImageUrl,
        mod,
        prompt,
        referenceImageUrls: extraRefs,
      });

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
          pipelineType: "APLUS",
          imageUrl,
          status: qaScore >= 7 ? "COMPLETE" : "FAILED",
          qaScore,
          targetWidth: mod.targetWidth,
          targetHeight: mod.targetHeight,
        },
        update: {
          imageUrl,
          status: qaScore >= 7 ? "COMPLETE" : "FAILED",
          qaScore,
          pipelineType: "APLUS",
          targetWidth: mod.targetWidth,
          targetHeight: mod.targetHeight,
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
          pipelineType: "APLUS",
          status: "FAILED",
          targetWidth: mod.targetWidth,
          targetHeight: mod.targetHeight,
          errorMessage: message,
        },
        update: {
          status: "FAILED",
          errorMessage: message,
          targetWidth: mod.targetWidth,
          targetHeight: mod.targetHeight,
        },
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

export async function markAplusPipelineFailed(productId: string, error: string) {
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
