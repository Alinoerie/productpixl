import { prisma } from "@/lib/prisma";
import { runCopyResearch } from "@/pipelines/tavily";
import { generateListingCopy } from "@/pipelines/copy-gen";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { listingCopyWhere } from "@/lib/listing-copy";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ProductAnalysis } from "@/lib/ai";

export type CopyPipelineInput = {
  productId: string;
  marketplace: string;
  intake: ProductIntakeData;
  playbooksContext?: string;
};

export async function markCopyPipelineFailed(
  productId: string,
  marketplace: string,
  message: string
) {
  await prisma.listingCopy.update({
    where: listingCopyWhere(productId, marketplace),
    data: { status: "FAILED", errorMessage: message },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "FAILED",
      pipelineStatus: {
        phase: "FAILED",
        error: message,
        steps: [],
      },
    },
  });
}

export async function runCopyPipelineCore(input: CopyPipelineInput) {
  const { productId, marketplace, intake, playbooksContext } = input;
  const where = listingCopyWhere(productId, marketplace);

  await prisma.listingCopy.upsert({
    where,
    create: { productId, marketplace, status: "PROCESSING" },
    update: { status: "PROCESSING", errorMessage: null },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "PROCESSING",
      pipelineStatus: { phase: "RESEARCHING", steps: [] },
    },
  });

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const brandProfile = await getBrandProfileForUser(product.userId);

  await prisma.product.update({
    where: { id: productId },
    data: { pipelineStatus: { phase: "RESEARCHING", steps: [] } },
  });

  const research = await runCopyResearch(intake.name, intake.category, marketplace);

  await prisma.product.update({
    where: { id: productId },
    data: { pipelineStatus: { phase: "GENERATING", steps: [] } },
  });

  const analysis = product.analysisJson as ProductAnalysis | null;
  const brandName = intake.brandName || brandProfile.displayName || "";
  const copy = await generateListingCopy({
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
    playbooksContext,
  });

  await prisma.listingCopy.update({
    where,
    data: {
      title: copy.title,
      bullets: copy.bullets,
      description: copy.description,
      backendKeywords: copy.backendKeywords,
      status: "COMPLETE",
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "COMPLETE",
      pipelineStatus: { phase: "COMPLETE", steps: [] },
    },
  });

  return { productId, status: "COMPLETE" as const };
}

/** Run copy for multiple marketplaces sequentially. */
export async function runCopyPipelineMulti(input: {
  productId: string;
  marketplaces: string[];
  intake: ProductIntakeData;
  playbooksContext?: string;
}) {
  const marketplaces = [...new Set(input.marketplaces.filter(Boolean))];
  for (const marketplace of marketplaces) {
    await runCopyPipelineCore({
      productId: input.productId,
      marketplace,
      intake: input.intake,
      playbooksContext: input.playbooksContext,
    });
  }
  return { productId: input.productId, status: "COMPLETE" as const, marketplaces };
}
