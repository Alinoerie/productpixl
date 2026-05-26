import { prisma } from "@/lib/prisma";
import { analyzeProductImage, scoreImageQuality } from "@/lib/ai";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { intakeFromProduct } from "@/lib/credit-pricing";
import { getModulesForRun, type ListingModuleId } from "@/pipelines/modules";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { FIDELITY_RETRY_PREFIX, generateListingImage } from "@/pipelines/image-gen";
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

  const brandProfile = await getBrandProfileForUser(params.userId);
  const intake = intakeFromProduct(product);
  intake.brandName = brandProfile.displayName || intake.brandName;

  let analysis = product.analysisJson as ProductAnalysis | null;
  if (!analysis?.productName || analysis._sourceImageUrl !== product.inputImageUrl) {
    analysis = await analyzeProductImage(product.inputImageUrl);
    await prisma.product.update({
      where: { id: product.id },
      data: { analysisJson: analysis as object },
    });
  }

  const research = (product.researchJson as ResearchSummary | null) ?? {
    categoryThemes: [],
    positioningGaps: [],
    objections: [],
    antiPatterns: [],
  };

  const mod = getModulesForRun(true).find((m) => m.id === params.moduleId);
  if (!mod) throw new Error("Invalid module");

  const prompt = buildListingPrompt(mod.id, analysis, intake, research, {
    brandProfile,
    marketplace: product.marketplace,
    spotEditHint: params.spotEditHint,
  });

  const extraRefs = intake.referenceImageUrls ?? [];
  let buffer = await generateListingImage(
    product.inputImageUrl,
    prompt,
    mod.id,
    mod.resolution,
    { referenceImageUrls: extraRefs, allowFallback: mod.id !== "L1" }
  );
  let imageUrl = await uploadBufferToCloudinary(
    buffer,
    `productpixl/${params.userId}/${params.productId}`
  );
  let qaScore = await scoreImageQuality(imageUrl, mod.id, product.inputImageUrl);

  if (qaScore < 7) {
    buffer = await generateListingImage(
      product.inputImageUrl,
      `${FIDELITY_RETRY_PREFIX}${prompt}`,
      mod.id,
      mod.resolution,
      { referenceImageUrls: extraRefs, allowFallback: false }
    );
    imageUrl = await uploadBufferToCloudinary(
      buffer,
      `productpixl/${params.userId}/${params.productId}`
    );
    qaScore = await scoreImageQuality(imageUrl, mod.id, product.inputImageUrl);
  }

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
      errorMessage: qaScore >= 7 ? null : "Quality check below threshold after retry",
    },
  });

  return { asset, imageUrl, qaScore };
}
