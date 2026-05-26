import { prisma } from "@/lib/prisma";
import { analyzeProductImage, scoreImageQuality } from "@/lib/ai";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { getModulesForRun, type ListingModuleId } from "@/pipelines/modules";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { generateListingImage } from "@/pipelines/image-gen";
import type { ResearchSummary } from "@/pipelines/prompt-builder";
import type { ProductAnalysis } from "@/lib/ai";

export async function regenerateAsset(params: {
  productId: string;
  userId: string;
  moduleId: ListingModuleId;
  spotEditHint: string;
}) {
  const product = await prisma.product.findFirst({
    where: { id: params.productId, userId: params.userId },
  });
  if (!product) throw new Error("Product not found");

  const analysis = (product.analysisJson as ProductAnalysis | null) ?? (await analyzeProductImage(product.inputImageUrl));
  const research = (product.researchJson as ResearchSummary | null) ?? {
    categoryThemes: [],
    positioningGaps: [],
    objections: [],
    antiPatterns: [],
  };

  const brandProfile = await getBrandProfileForUser(params.userId);
  const mod = getModulesForRun(true).find((m) => m.id === params.moduleId);
  if (!mod) throw new Error("Invalid module");

  const intake = {
    name: product.name,
    brandName: analysis.brandName ?? product.name,
    category: product.amazonCategory ?? "General",
    dimensions: product.dimensions ?? undefined,
    materials: product.materials ?? undefined,
    colors: product.colors ?? undefined,
    keyFeatures: product.keyFeatures ?? undefined,
    targetBuyer: product.targetBuyer ?? undefined,
    competitors: product.competitors ?? undefined,
  };

  const prompt = buildListingPrompt(mod.id, analysis, intake, research, {
    brandProfile,
    marketplace: product.marketplace,
    spotEditHint: params.spotEditHint,
  });

  const buffer = await generateListingImage(
    product.inputImageUrl,
    prompt,
    mod.id,
    mod.resolution
  );
  const imageUrl = await uploadBufferToCloudinary(
    buffer,
    `productpixl/${params.userId}/${params.productId}`
  );
  const qaScore = await scoreImageQuality(imageUrl, mod.id);

  const asset = await prisma.asset.upsert({
    where: { id: `${params.productId}-${mod.id}` },
    create: {
      id: `${params.productId}-${mod.id}`,
      productId: params.productId,
      moduleId: mod.id,
      pipelineType: "LISTING",
      imageUrl,
      status: qaScore >= 7 ? "COMPLETE" : "FAILED",
      qaScore,
      retryCount: 1,
    },
    update: {
      imageUrl,
      status: qaScore >= 7 ? "COMPLETE" : "FAILED",
      qaScore,
      retryCount: { increment: 1 },
      errorMessage: null,
    },
  });

  return { asset, imageUrl, qaScore };
}
