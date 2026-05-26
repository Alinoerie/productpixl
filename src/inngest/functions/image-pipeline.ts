import { inngest, IMAGE_PIPELINE_EVENT } from "../client";
import { prisma } from "@/lib/prisma";
import { analyzeProductImage, type ProductAnalysis } from "@/lib/ai";
import type { ProductIntakeData } from "@/lib/product-intake";
import { scoreImageQuality } from "@/lib/ai";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { runCategoryResearch } from "@/pipelines/tavily";
import { getModulesForRun } from "@/pipelines/modules";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { FIDELITY_RETRY_PREFIX, generateListingImage } from "@/pipelines/image-gen";

type Phase =
  | "RECEIVING"
  | "ANALYZING"
  | "RESEARCHING"
  | "SELECTING"
  | "GENERATING"
  | "QA"
  | "COMPLETE"
  | "FAILED";

interface StepState {
  id: string;
  label: string;
  status: "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";
  imageUrl?: string;
  qaScore?: number;
  prompt?: string;
  error?: string;
}

interface PipelineStatus {
  phase: Phase;
  steps: StepState[];
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

function referenceUrls(intake: ProductIntakeData): string[] {
  return (intake.referenceImageUrls ?? []).filter(Boolean);
}

async function loadPipelineStatus(productId: string): Promise<PipelineStatus> {
  const row = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { pipelineStatus: true },
  });
  return row.pipelineStatus as unknown as PipelineStatus;
}

async function savePipelineStatus(productId: string, status: PipelineStatus) {
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
  let buffer = await generateListingImage(inputImageUrl, prompt, mod.id, mod.resolution, {
    referenceImageUrls,
    allowFallback: mod.id !== "L1",
  });

  let imageUrl = await uploadBufferToCloudinary(
    buffer,
    `productpixl/${userId}/${productId}`
  );
  let qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);

  if (qaScore < 7) {
    const retryPrompt = `${FIDELITY_RETRY_PREFIX}${prompt}`;
    buffer = await generateListingImage(inputImageUrl, retryPrompt, mod.id, mod.resolution, {
      referenceImageUrls,
      allowFallback: false,
    });
    imageUrl = await uploadBufferToCloudinary(buffer, `productpixl/${userId}/${productId}`);
    qaScore = await scoreImageQuality(imageUrl, mod.id, inputImageUrl);
  }

  return { imageUrl, qaScore, prompt };
}

export const imagePipeline = inngest.createFunction(
  {
    id: "image-pipeline-run",
    retries: 3,
  },
  { event: IMAGE_PIPELINE_EVENT },
  async ({ event, step }) => {
    const { productId, includePackaging, intake, analysis: presetAnalysis } = event.data as {
      productId: string;
      includePackaging: boolean;
      promptOverrides?: Record<string, string>;
      analysis?: ProductAnalysis;
      intake: ProductIntakeData;
    };

    const product = await step.run("load-product", () =>
      prisma.product.findUniqueOrThrow({
        where: { id: productId },
        include: { user: true },
      })
    );

    const brandProfile = await step.run("load-brand", () =>
      getBrandProfileForUser(product.userId)
    );

    const modules = getModulesForRun(includePackaging);
    const extraRefs = referenceUrls(intake);

    await step.run("init-status", async () => {
      const initial: PipelineStatus = {
        phase: "RECEIVING",
        steps: modules.map((m) => ({ id: m.id, label: m.label, status: "PENDING" })),
        currentStepIndex: 0,
        startedAt: new Date().toISOString(),
      };
      await savePipelineStatus(productId, initial);
    });

    const analysis = await step.run("analyze", async () => {
      const pipelineStatus = await loadPipelineStatus(productId);
      pipelineStatus.phase = "ANALYZING";
      await savePipelineStatus(productId, pipelineStatus);

      if (presetAnalysis) {
        const withSource = { ...presetAnalysis, _sourceImageUrl: product.inputImageUrl };
        await prisma.product.update({
          where: { id: productId },
          data: { analysisJson: withSource as object },
        });
        return withSource;
      }

      const existing = product.analysisJson as ProductAnalysis | null;
      if (existing?.productName && existing._sourceImageUrl === product.inputImageUrl) {
        return existing;
      }

      const result = await analyzeProductImage(product.inputImageUrl);
      await prisma.product.update({
        where: { id: productId },
        data: { analysisJson: result as object },
      });
      return result;
    });

    const research = await step.run("research", async () => {
      const pipelineStatus = await loadPipelineStatus(productId);
      pipelineStatus.phase = "RESEARCHING";
      await savePipelineStatus(productId, pipelineStatus);

      const result = await runCategoryResearch(intake.name, intake.category);
      await prisma.product.update({
        where: { id: productId },
        data: { researchJson: result as object },
      });
      return result;
    });

    await step.run("select-modules", async () => {
      const pipelineStatus = await loadPipelineStatus(productId);
      pipelineStatus.phase = "SELECTING";
      await savePipelineStatus(productId, pipelineStatus);
    });

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];

      await step.run(`generate-${mod.id}`, async () => {
        const pipelineStatus = await loadPipelineStatus(productId);
        pipelineStatus.phase = "GENERATING";
        pipelineStatus.steps[i].status = "GENERATING";
        pipelineStatus.currentStepIndex = i;
        await savePipelineStatus(productId, pipelineStatus);

        try {
          const prompt =
            event.data.promptOverrides?.[mod.id]?.trim() ||
            buildListingPrompt(mod.id, analysis, intake, research, {
              brandProfile,
              marketplace: product.marketplace,
            });

          const { imageUrl, qaScore } = await generateModuleAsset({
            productId,
            userId: product.userId,
            inputImageUrl: product.inputImageUrl,
            mod,
            prompt,
            referenceImageUrls: extraRefs,
          });

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
            },
            update: {
              imageUrl,
              status: qaScore >= 7 ? "COMPLETE" : "FAILED",
              qaScore,
              errorMessage: qaScore >= 7 ? null : "Quality check below threshold after retry",
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Generation failed";
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
      });
    }

    await step.run("qa-complete", async () => {
      const pipelineStatus = await loadPipelineStatus(productId);
      const anyComplete = pipelineStatus.steps.some((s) => s.status === "COMPLETE");
      const allFailed = pipelineStatus.steps.every((s) => s.status === "FAILED");

      if (allFailed || !anyComplete) {
        pipelineStatus.phase = "FAILED";
        pipelineStatus.error = allFailed
          ? "All gallery modules failed to generate."
          : "No modules completed successfully.";
      } else {
        pipelineStatus.phase = "COMPLETE";
      }
      pipelineStatus.completedAt = new Date().toISOString();
      await savePipelineStatus(productId, pipelineStatus);
    });

    return { productId };
  }
);
