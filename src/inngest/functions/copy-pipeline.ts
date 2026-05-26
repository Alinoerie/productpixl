import { inngest, COPY_PIPELINE_EVENT } from "../client";
import { prisma } from "@/lib/prisma";
import { runCopyResearch } from "@/pipelines/tavily";
import { generateListingCopy } from "@/pipelines/copy-gen";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";

export const copyPipeline = inngest.createFunction(
  { id: "copy-pipeline-run", retries: 3 },
  { event: COPY_PIPELINE_EVENT },
  async ({ event, step }) => {
    const { productId, marketplace, intake } = event.data as {
      productId: string;
      marketplace: string;
      intake: ProductIntakeData;
    };

    await step.run("mark-processing", () =>
      prisma.listingCopy.upsert({
        where: { productId },
        create: { productId, marketplace, status: "PROCESSING" },
        update: { status: "PROCESSING", marketplace, errorMessage: null },
      })
    );

    const product = await step.run("load", () =>
      prisma.product.findUniqueOrThrow({ where: { id: productId } })
    );

    const brandProfile = await step.run("brand", () => getBrandProfileForUser(product.userId));

    const research = await step.run("research", () =>
      runCopyResearch(intake.name, intake.category, marketplace)
    );

    const copy = await step.run("generate", async () => {
      const analysis = product.analysisJson as ProductAnalysis | null;
      const brandName = intake.brandName || brandProfile.displayName || "";
      return generateListingCopy({
        productName: intake.name,
        brandName,
        category: intake.category,
        marketplace,
        materials: intake.materials ?? product.materials ?? undefined,
        keyFeatures: intake.keyFeatures ?? product.keyFeatures ?? undefined,
        targetBuyer: intake.targetBuyer ?? product.targetBuyer ?? undefined,
        vibe: intake.vibe ?? product.vibe ?? undefined,
        useCase: intake.useCase ?? product.useCase ?? undefined,
        differentiators: intake.differentiators ?? product.differentiators ?? undefined,
        competitors: intake.competitors ?? product.competitors ?? undefined,
        analysisSummary: analysis?.keyObservations,
        researchSnippets: research.snippets,
        keywords: research.keywords,
        competitorTitles: research.competitorTitles,
        brandProfile,
      });
    });

    await step.run("save", () =>
      prisma.listingCopy.update({
        where: { productId },
        data: {
          title: copy.title,
          bullets: copy.bullets,
          description: copy.description,
          backendKeywords: copy.backendKeywords,
          status: "COMPLETE",
        },
      })
    );

    await step.run("product-complete", () =>
      prisma.product.update({
        where: { id: productId },
        data: { status: "COMPLETE" },
      })
    );

    return { productId, status: "COMPLETE" };
  }
);
