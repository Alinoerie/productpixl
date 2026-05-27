import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeProductImage, type ProductAnalysis } from "@/lib/ai";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import type { ProductIntakeData } from "@/lib/product-intake";
import { quoteImageRun } from "@/lib/credit-pricing";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { getModulesForRun } from "@/pipelines/modules";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { runCategoryResearch } from "@/pipelines/tavily";
import { getVisualTemplate, templateContextBlock } from "@/lib/templates/catalog";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    inputImageUrl?: string;
    includePackaging?: boolean;
    selectedModules?: import("@/pipelines/modules").ListingModuleId[];
    marketplace?: string;
    analysis?: ProductAnalysis;
    productData?: ProductIntakeData;
    templateSlug?: string;
  };

  if (!body.inputImageUrl || !body.productData?.name || !body.productData?.category) {
    return NextResponse.json(
      { error: "inputImageUrl, productData.name, and productData.category are required" },
      { status: 400 }
    );
  }

  const quote = quoteImageRun({
    includePackaging: Boolean(body.includePackaging),
    selectedModules: body.selectedModules,
    marketplace: body.marketplace ?? "AMAZON_US",
    intake: body.productData,
  });

  if (!(await requireCredits(session.user.id, quote.total))) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  const brandProfile = await getBrandProfileForUser(session.user.id);
  const productData: ProductIntakeData = {
    ...body.productData,
    brandName: body.productData.brandName || brandProfile.displayName || body.productData.brandName,
    referenceImageUrls: body.productData.referenceImageUrls ?? [],
  };

  const template = body.templateSlug ? getVisualTemplate(body.templateSlug) : undefined;
  const templateContext = template
    ? templateContextBlock(template, productData.brandName || brandProfile.displayName || "")
    : undefined;

  const [analysis, research] = await Promise.all([
    body.analysis ? Promise.resolve(body.analysis) : analyzeProductImage(body.inputImageUrl),
    runCategoryResearch(productData.name, productData.category),
  ]);

  const modules = getModulesForRun({
    includePackaging: Boolean(body.includePackaging),
    selectedModules: body.selectedModules,
  });
  const prompts = modules.map((mod) => ({
    moduleId: mod.id,
    label: mod.label,
    resolution: mod.resolution,
    prompt: buildListingPrompt(mod.id, analysis, productData, research, {
      brandProfile,
      marketplace: body.marketplace ?? "AMAZON_US",
      templateContext,
    }),
  }));

  return NextResponse.json({
    analysis,
    research,
    prompts,
    quote,
  });
}
