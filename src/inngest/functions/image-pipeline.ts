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
import { generateListingImage } from "@/pipelines/image-gen";

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

    const setStatus = async (status: PipelineStatus) => {
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
    };

    const pipelineStatus: PipelineStatus = {
      phase: "RECEIVING",
      steps: modules.map((m) => ({ id: m.id, label: m.label, status: "PENDING" })),
      currentStepIndex: 0,
      startedAt: new Date().toISOString(),
    };
    await setStatus(pipelineStatus);

    const analysis = await step.run("analyze", async () => {
      pipelineStatus.phase = "ANALYZING";
      await setStatus(pipelineStatus);
      if (presetAnalysis) {
        await prisma.product.update({
          where: { id: productId },
          data: { analysisJson: presetAnalysis as object },
        });
        return presetAnalysis;
      }
      const existing = product.analysisJson as ProductAnalysis | null;
      if (existing?.productName) {
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
      pipelineStatus.phase = "RESEARCHING";
      await setStatus(pipelineStatus);
      const result = await runCategoryResearch(intake.name, intake.category);
      await prisma.product.update({
        where: { id: productId },
        data: { researchJson: result as object },
      });
      return result;
    });

    await step.run("select-modules", async () => {
      pipelineStatus.phase = "SELECTING";
      await setStatus(pipelineStatus);
    });

    await step.run("generate-all", async () => {
      pipelineStatus.phase = "GENERATING";
      await setStatus(pipelineStatus);

      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        pipelineStatus.steps[i].status = "GENERATING";
        pipelineStatus.currentStepIndex = i;
        await setStatus(pipelineStatus);

        try {
          const prompt =
            event.data.promptOverrides?.[mod.id]?.trim() ||
            buildListingPrompt(mod.id, analysis, intake, research, {
            brandProfile,
            marketplace: product.marketplace,
            });
          pipelineStatus.steps[i].prompt = prompt;
          const buffer = await generateListingImage(
            product.inputImageUrl,
            prompt,
            mod.id,
            mod.resolution
          );
          const folder = `productpixl/${product.userId}/${productId}`;
          const imageUrl = await uploadBufferToCloudinary(buffer, folder);
          const qaScore = await scoreImageQuality(imageUrl, mod.id);

          pipelineStatus.steps[i].status = qaScore >= 7 ? "COMPLETE" : "FAILED";
          pipelineStatus.steps[i].imageUrl = imageUrl;
          pipelineStatus.steps[i].qaScore = qaScore;

          await prisma.asset.upsert({
            where: {
              id: `${productId}-${mod.id}`,
            },
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

        await setStatus(pipelineStatus);
      }
    });

    await step.run("qa-complete", async () => {
      pipelineStatus.phase = "COMPLETE";
      pipelineStatus.completedAt = new Date().toISOString();
      await setStatus(pipelineStatus);
    });

    return { productId, phase: "COMPLETE" };
  }
);
