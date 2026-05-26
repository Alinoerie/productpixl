import type { ProductAnalysis } from "@/lib/ai";
import type { BrandProfileData } from "@/lib/brand-profile";
import { brandContextBlock } from "@/lib/brand-profile";
import { getMarketplace } from "@/lib/marketplaces";
import type { ListingModuleId } from "./modules";

export interface IntakeData {
  name: string;
  brandName: string;
  category?: string;
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
  const antiPatterns = research.antiPatterns.length
    ? research.antiPatterns
    : [
        "smiling model on plain studio backdrop",
        "floating product with gradient background",
        "over-saturated CGI rendering",
      ];
  const positioningGap =
    research.positioningGaps[0] ?? "authentic premium lifestyle with credible material proof";
  const trigger = research.objections[0] ?? "reduce buyer uncertainty about quality and fit";
  const scaleAnchor = buildScaleAnchor(intake.dimensions);

  const constraints = `
[CONSTRAINT BLOCK]
The product in the reference image is a ${intake.brandName} ${analysis.productType}. Exact specifications:
— Product name: ${intake.name || analysis.productName}
— Amazon category: ${intake.category || analysis.amazonCategory}
— Primary color: ${intake.colors || analysis.colors}
— Materials / ingredients: ${intake.materials || analysis.materials}
— Label text reads EXACTLY: '${analysis.labelText}'
— Physical dimensions: ${intake.dimensions || "as shown in reference"}
— Scale anchor: ${scaleAnchor}
Do NOT change, regenerate, blur, distort, recolor, restyle, or alter product elements.
The product must remain IDENTICAL to reference fidelity.`;

  const scenes: Record<ListingModuleId, string> = {
    L1: `
[SCENE BLOCK — L1 MAIN HERO]
Scene: Pure white (#FFFFFF) infinity cove, product only, no props, no models, no hands.
Product occupies 75–85% of frame, centered, front-facing or slight 3/4 view, full label legible.
Amazon main-image constraints are absolute: no text overlays, no watermarks, no environmental context.`,
    L3: `
[SCENE BLOCK — L3 LIFESTYLE IN-CONTEXT]
Foreground (0–30% depth): one specific supporting prop that matches buyer context, no clutter.
Mid-ground (30–60% depth): product in natural use by ${intake.targetBuyer || "target buyer"}, scale anchored to ${scaleAnchor}.
Background (60–100% depth): realistic environment with warm, natural light and clear depth.
COMPETITOR CONTRAST: avoid cliché "${antiPatterns[0]}"; differentiate via "${positioningGap}".
TRIGGER ACTIVATION: address buyer objection "${trigger}" through visible in-use proof and realistic scale.`,
    L4: `
[SCENE BLOCK — L4 TEXTURE & DETAIL]
Scene: extreme macro close-up focused on tactile quality and construction detail.
Show real material grain: ${intake.materials || analysis.materials}.
Controlled side-light to reveal depth and authenticity; no synthetic CGI smoothness.
COMPETITOR CONTRAST: avoid cliché "${antiPatterns[1] ?? antiPatterns[0]}"; prioritize premium material proof.`,
    L8: `
[SCENE BLOCK — L8 PACKAGING & UNBOXING]
Scene: packaging and first-touch unboxing layout, clean and inviting.
Packaging branding must remain accurate and legible.
Props must be specific and minimal; visual focus stays on the product and included contents.
TRIGGER ACTIVATION: reduce uncertainty by clearly showing what arrives and product readiness.`,
  };

  const style = `
[STYLE & QUALITY ENFORCEMENT]
Authentic product photography — NOT CGI, NOT stylized render.
Camera & lens: Sony A7R V · FE 90mm Macro @ f/5.6 for detail fidelity.
Lighting: realistic commercial setup with natural highlight falloff and controlled shadows.
Mood: ${analysis.mood}. Marketplace fit: ${marketplace.label}.
Aspect ratio: 1:1 square. Target output: 1500×1500px, listing-ready.`;

  const negative = `
[NEGATIVE PROMPT BLOCK]
DO NOT generate:
— ${antiPatterns[0]}
— ${antiPatterns[1] ?? antiPatterns[0]}
— ${antiPatterns[2] ?? antiPatterns[0]}
— deformed hands, faces, or floating objects
— hallucinated text or logos in background
— incorrect label spelling or altered branding
— unrealistic scaling that violates "${scaleAnchor}"`;

  const brandBlock = options?.brandProfile ? brandContextBlock(options.brandProfile) : "";
  const marketBlock = `Marketplace: ${marketplace.label}. ${marketplace.imageNote}`;
  const spotBlock = options?.spotEditHint
    ? `Spot edit instruction (apply to this regeneration only): ${options.spotEditHint}`
    : "";

  return [
    constraints.trim(),
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

function buildScaleAnchor(dimensions?: string): string {
  if (!dimensions) return "roughly the size shown in the reference image";
  const matches = dimensions.match(/\d+(\.\d+)?/g);
  if (!matches?.length) return "roughly the size shown in the reference image";
  const largest = Math.max(...matches.map((v) => Number(v)));
  if (largest < 2) return "roughly the size of a human fingernail";
  if (largest <= 5) return "roughly the size of a Lego brick";
  if (largest <= 10) return "roughly the size of half a smartphone";
  if (largest <= 20) return "roughly the size of a smartphone";
  if (largest <= 30) return "roughly the size of a paperback book";
  if (largest <= 50) return "roughly the size of a shoebox";
  return "roughly the size of a laptop";
}
