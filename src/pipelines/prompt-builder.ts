import type { ProductAnalysis } from "@/lib/ai";
import type { BrandProfileData } from "@/lib/brand-profile";
import { brandContextBlock } from "@/lib/brand-profile";
import { getMarketplace } from "@/lib/marketplaces";
import type { ListingModuleId } from "./modules";

export interface IntakeData {
  name: string;
  brandName: string;
  dimensions?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
}

export interface ResearchSummary {
  categoryThemes: string[];
  positioningGaps: string[];
  objections: string[];
  antiPatterns: string[];
}

export function buildListingPrompt(
  moduleId: ListingModuleId,
  analysis: ProductAnalysis,
  intake: IntakeData,
  research: ResearchSummary,
  options?: {
    brandProfile?: BrandProfileData;
    marketplace?: string;
    spotEditHint?: string;
  }
): string {
  const marketplace = getMarketplace(options?.marketplace ?? "AMAZON_US");
  const constraint = `
The product in the reference image is a ${intake.brandName} ${analysis.productType}. Exact specifications:
— Primary color: ${intake.colors || analysis.colors}
— Materials: ${intake.materials || analysis.materials}
— Text on label reads EXACTLY: '${analysis.labelText}'
— Physical dimensions: ${intake.dimensions || "as shown in reference"}
— Scale anchor: enforce realistic product scale; do not enlarge beyond stated size.
Do NOT change, blur, distort, recolor, or alter any product elements. Output must match reference fidelity.`;

  const anti = research.antiPatterns.slice(0, 2).join("; ") || "generic stock photo aesthetic";
  const gap = research.positioningGaps[0] ?? "authentic premium lifestyle";
  const negative = `
DO NOT generate: ${anti}; deformed hands; floating objects; hallucinated background text; competitor logos.`;

  const scenes: Record<ListingModuleId, string> = {
    L1: `Scene: Pure white (#FFFFFF) infinity backdrop. Product only — no props, models, or hands. Center-framed 80% of frame. Even studio lighting. Amazon main image standard.`,
    L3: `Scene: Lifestyle in-context — ${intake.targetBuyer || "target buyer"} using the product in a relatable aspirational setting. Warm natural light. Mood: ${analysis.mood}. Fill positioning gap: ${gap}.`,
    L4: `Scene: Extreme macro texture close-up — material, stitching, surface quality. ${analysis.materials}. Controlled side lighting revealing texture.`,
    L8: `Scene: Packaging and unboxing — branded packaging visible, contents laid out invitingly. Bright welcoming light. First-touch anticipation.`,
  };

  const style = `
Style: Authentic product photography — NOT CGI. Lens: Sony A7R V · FE 90mm Macro @ f/5.6. Mood: ${analysis.mood}.
Aspect ratio: 1:1 square. Target 1500×1500px. Amazon listing standard.`;

  const brandBlock = options?.brandProfile ? brandContextBlock(options.brandProfile) : "";
  const marketBlock = `Marketplace: ${marketplace.label}. ${marketplace.imageNote}`;
  const spotBlock = options?.spotEditHint
    ? `Spot edit instruction (apply to this regeneration only): ${options.spotEditHint}`
    : "";

  return [
    constraint.trim(),
    brandBlock,
    marketBlock,
    scenes[moduleId],
    style.trim(),
    negative.trim(),
    spotBlock,
  ]
    .filter(Boolean)
    .join("\n\n");
}
