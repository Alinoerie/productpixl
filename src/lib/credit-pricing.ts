import type { ProductIntakeData } from "@/lib/product-intake";
import { getModulesForRun, type ListingModuleId } from "@/pipelines/modules";

/** Opaque per-module weights — summed per image, not advertised as a rate card. */
const MODULE_WEIGHT: Record<ListingModuleId, number> = {
  L1: 4,
  L3: 8,
  L4: 3,
  L8: 5,
};

export type CreditQuote = {
  total: number;
  imageCount?: number;
  summary: string;
  detailLine: string;
};

export type CreditPricingContext = {
  marketplace: string;
  intake: Partial<ProductIntakeData>;
};

function intakeDepth(intake: Partial<ProductIntakeData>): number {
  let depth = 0;
  const fields = [
    intake.materials,
    intake.colors,
    intake.dimensions,
    intake.keyFeatures,
    intake.targetBuyer,
    intake.competitors,
    intake.vibe,
    intake.useCase,
    intake.differentiators,
  ];
  for (const value of fields) {
    const len = value?.trim().length ?? 0;
    if (len > 80) depth += 2;
    else if (len > 24) depth += 1;
    else if (len > 0) depth += 0.5;
  }
  depth += Math.min(intake.referenceImageUrls?.length ?? 0, 4) * 1.25;
  if ((intake.category?.trim().length ?? 0) > 40) depth += 1;
  if ((intake.name?.trim().length ?? 0) > 0 && (intake.brandName?.trim().length ?? 0) > 0) depth += 0.5;
  return depth;
}

function marketplaceDepth(marketplace: string): number {
  if (marketplace === "AMAZON_US" || marketplace === "SHOPIFY") return 0;
  if (marketplace === "BOL_COM") return 3;
  if (marketplace.startsWith("AMAZON_")) return 2;
  return 1;
}

function roundCredits(value: number): number {
  return Math.max(1, Math.ceil(value));
}

function creditsForModule(moduleId: ListingModuleId, ctx: CreditPricingContext): number {
  const base = MODULE_WEIGHT[moduleId];
  const depth = intakeDepth(ctx.intake);
  const market = marketplaceDepth(ctx.marketplace);
  const resolutionLift = moduleId === "L1" || moduleId === "L3" ? 1.5 : 0.75;
  const sceneLift = moduleId === "L3" ? 2 : moduleId === "L8" ? 1.25 : 0;
  return roundCredits(base + depth * 0.45 + market * 0.35 + resolutionLift + sceneLift);
}

function pipelineOrchestration(ctx: CreditPricingContext, moduleCount: number): number {
  const depth = intakeDepth(ctx.intake);
  const market = marketplaceDepth(ctx.marketplace);
  return roundCredits(2 + moduleCount * 0.6 + depth * 0.35 + market * 0.5);
}

export function quoteImageRun(params: {
  includePackaging: boolean;
  marketplace: string;
  intake: Partial<ProductIntakeData>;
}): CreditQuote {
  const ctx: CreditPricingContext = {
    marketplace: params.marketplace,
    intake: params.intake,
  };
  const modules = getModulesForRun(params.includePackaging);
  const perImage = modules.map((mod) => creditsForModule(mod.id, ctx));
  const imageTotal = perImage.reduce((sum, n) => sum + n, 0);
  const orchestration = pipelineOrchestration(ctx, modules.length);
  const total = imageTotal + orchestration;
  const depth = intakeDepth(params.intake);
  const market = marketplaceDepth(params.marketplace);

  return {
    total,
    imageCount: modules.length,
    summary: formatCreditsRequired(total),
    detailLine: buildDetailLine({
      imageCount: modules.length,
      includePackaging: params.includePackaging,
      depth,
      market,
      kind: "image",
    }),
  };
}

export function quoteCopyRun(params: {
  marketplace: string;
  intake: Partial<ProductIntakeData>;
}): CreditQuote {
  const depth = intakeDepth(params.intake);
  const market = marketplaceDepth(params.marketplace);
  let total = 7;
  total += depth * 1.15;
  total += market * 2.25;
  if (params.intake.competitors?.trim()) total += 2;
  if ((params.intake.referenceImageUrls?.length ?? 0) > 0) total += 2;
  if ((params.intake.keyFeatures?.trim().length ?? 0) > 60) total += 1;

  const rounded = roundCredits(total);
  return {
    total: rounded,
    summary: formatCreditsRequired(rounded),
    detailLine: buildDetailLine({
      depth,
      market,
      kind: "copy",
    }),
  };
}

/** Multi-marketplace copy run — base quote plus per-additional-marketplace lift. */
export function quoteCopyRunMulti(params: {
  marketplaces: string[];
  intake: Partial<ProductIntakeData>;
}): CreditQuote {
  const unique = [...new Set(params.marketplaces.filter(Boolean))];
  if (unique.length === 0) {
    return quoteCopyRun({ marketplace: "AMAZON_US", intake: params.intake });
  }
  let total = 0;
  for (const marketplace of unique) {
    total += quoteCopyRun({ marketplace, intake: params.intake }).total;
  }
  if (unique.length > 1) {
    total = roundCredits(total * 0.92);
  }
  return {
    total,
    summary: formatCreditsRequired(total),
    detailLine:
      unique.length > 1
        ? `${unique.length} marketplaces · localized copy stack — estimate updates with intake depth`
        : quoteCopyRun({ marketplace: unique[0]!, intake: params.intake }).detailLine,
  };
}

/** Single section regenerate (title, bullet, description, keywords). */
export function quoteCopySection(marketplace: string): CreditQuote {
  const market = marketplaceDepth(marketplace);
  const total = roundCredits(1 + market * 0.35);
  return {
    total,
    summary: formatCreditsRequired(total),
    detailLine: "One section refresh · marketplace rules applied",
  };
}

export function quoteVideoRun(params: {
  formatCredits: number;
  musicEnabled: boolean;
}): CreditQuote {
  const music = params.musicEnabled ? 8 : 0;
  const total = roundCredits(params.formatCredits + music + 12);
  return {
    total,
    summary: formatCreditsRequired(total),
    detailLine: "Beta video reel · hero loop + feature showcase",
  };
}

export function quoteImageModuleBreakdown(params: {
  includePackaging: boolean;
  marketplace: string;
  intake: Partial<ProductIntakeData>;
}): { label: string; credits: number }[] {
  const ctx: CreditPricingContext = {
    marketplace: params.marketplace,
    intake: params.intake,
  };
  const modules = getModulesForRun(params.includePackaging);
  const perImage = modules.map((mod) => ({
    label: mod.label ?? mod.id,
    credits: creditsForModule(mod.id, ctx),
  }));
  const orchestration = pipelineOrchestration(ctx, modules.length);
  return [...perImage, { label: "Pipeline", credits: orchestration }];
}

export function quoteRegenerateModule(
  moduleId: ListingModuleId,
  marketplace: string,
  intake: Partial<ProductIntakeData>
): CreditQuote {
  const ctx: CreditPricingContext = { marketplace, intake };
  const single = creditsForModule(moduleId, ctx);
  const total = roundCredits(single + 1.5);
  return {
    total,
    imageCount: 1,
    summary: formatCreditsRequired(total),
    detailLine: "Single-image refinement · depth adjusts with your project data",
  };
}

export function formatCreditsRequired(total: number): string {
  return `${total.toLocaleString()} credit${total === 1 ? "" : "s"}`;
}

/** Typical image run for pricing calculator — mid-depth intake, US marketplace, 3 modules. */
export function typicalImageRunCredits(): number {
  return quoteImageRun({
    includePackaging: false,
    marketplace: "AMAZON_US",
    intake: {
      name: "Sample SKU",
      brandName: "Brand",
      category: "Home & Kitchen",
      materials: "Stainless steel and silicone trim",
      keyFeatures: "Dishwasher safe, BPA-free lid",
      targetBuyer: "Busy home cooks",
    },
  }).total;
}

/** Typical copy run for pricing calculator. */
export function typicalCopyRunCredits(): number {
  return quoteCopyRun({
    marketplace: "AMAZON_US",
    intake: {
      name: "Sample SKU",
      brandName: "Brand",
      category: "Home & Kitchen",
      keyFeatures: "Dishwasher safe, BPA-free lid",
      competitors: "Generic store-brand alternative",
    },
  }).total;
}

export function intakeFromProduct(product: {
  name: string;
  marketplace: string;
  amazonCategory: string | null;
  dimensions?: string | null;
  materials?: string | null;
  colors?: string | null;
  keyFeatures?: string | null;
  targetBuyer?: string | null;
  competitors?: string | null;
  vibe?: string | null;
  useCase?: string | null;
  differentiators?: string | null;
  referenceImageUrls?: string[] | null | unknown;
}): ProductIntakeData {
  const refs = product.referenceImageUrls;
  const referenceImageUrls = Array.isArray(refs)
    ? refs.filter((u): u is string => typeof u === "string")
    : [];
  return {
    name: product.name,
    brandName: "",
    category: product.amazonCategory ?? "",
    dimensions: product.dimensions ?? "",
    materials: product.materials ?? "",
    colors: product.colors ?? "",
    keyFeatures: product.keyFeatures ?? "",
    targetBuyer: product.targetBuyer ?? "",
    competitors: product.competitors ?? "",
    vibe: product.vibe ?? "",
    useCase: product.useCase ?? "",
    differentiators: product.differentiators ?? "",
    referenceImageUrls,
  };
}

function buildDetailLine(params: {
  imageCount?: number;
  includePackaging?: boolean;
  depth: number;
  market: number;
  kind: "image" | "copy";
}): string {
  const parts: string[] = [];
  if (params.kind === "image" && params.imageCount) {
    parts.push(
      `${params.imageCount} gallery image${params.imageCount === 1 ? "" : "s"}`
    );
    if (params.includePackaging) parts.push("packaging module");
  }
  if (params.kind === "copy") parts.push("research + RUFUS copy stack");
  if (params.depth >= 4) parts.push("rich product intake");
  else if (params.depth >= 2) parts.push("product detail depth");
  if (params.market >= 2) parts.push("EU marketplace localization");
  else if (params.market > 0) parts.push("marketplace rules");
  parts.push("quality checks");
  return `Based on ${parts.join(", ")} — estimate updates as you add detail`;
}
