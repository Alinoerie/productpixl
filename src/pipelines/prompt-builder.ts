import type { ProductAnalysis } from "@/lib/ai";
import type { BrandProfileData } from "@/lib/brand-profile";
import { brandContextBlock } from "@/lib/brand-profile";
import type { ProductIntakeData } from "@/lib/product-intake";
import { getMarketplace } from "@/lib/marketplaces";
import type { ListingModuleId } from "./modules";

export type IntakeData = ProductIntakeData;

export interface ResearchSummary {
  categoryThemes: string[];
  positioningGaps: string[];
  objections: string[];
  antiPatterns: string[];
}

function productContextBlock(analysis: ProductAnalysis, intake: IntakeData): string {
  const vibe = intake.vibe?.trim() || analysis.mood;
  const useCase = intake.useCase?.trim() || analysis.useCase;
  const differentiators =
    intake.differentiators?.trim() || intake.keyFeatures?.trim() || analysis.differentiators;
  const targetBuyer = intake.targetBuyer?.trim() || analysis.suggestedTargetBuyer;

  const lines = [
    "Product positioning:",
    `— Vibe / aesthetic: ${vibe}`,
    useCase ? `— Primary use case: ${useCase}` : null,
    differentiators ? `— Differentiators: ${differentiators}` : null,
    targetBuyer ? `— Target buyer: ${targetBuyer}` : null,
    intake.competitors?.trim() ? `— Differentiate from: ${intake.competitors.trim()}` : null,
    intake.referenceImageUrls?.length
      ? `— Style references: ${intake.referenceImageUrls.length} reference image(s) uploaded — match mood, palette, and photography style without copying unrelated products.`
      : null,
  ].filter(Boolean);

  return lines.join("\n");
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
    playbookContext?: string;
    templateContext?: string;
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
  const scaleAnchor = buildScaleAnchor(intake.dimensions || analysis.dimensions);

  const constraints = `
[CONSTRAINT BLOCK]
The product in the reference image is a ${intake.brandName || analysis.brandName} ${analysis.productType}. Exact specifications:
— Product name: ${intake.name || analysis.productName}
— Amazon category: ${intake.category || analysis.amazonCategory}
— Primary color: ${intake.colors || analysis.colors}
— Materials / ingredients: ${intake.materials || analysis.materials}
— Label text reads EXACTLY: '${analysis.labelText}'
— Physical dimensions: ${intake.dimensions || analysis.dimensions || "as shown in reference"}
— Scale anchor: ${scaleAnchor}
${analysis.keyObservations?.trim() ? `— Vision fidelity notes: ${analysis.keyObservations.trim()}` : ""}
The attached reference image(s) show the exact product — preserve it pixel-for-pixel except where scene instructions allow background or context changes only.
Do NOT change, regenerate, blur, distort, recolor, restyle, or alter product elements.
The product must remain IDENTICAL to reference fidelity.`;

  const buyer = intake.targetBuyer || analysis.suggestedTargetBuyer || "target buyer";

  const scenes: Record<ListingModuleId, string> = {
    L1: `
[SCENE BLOCK — L1 MAIN HERO]
Scene: Pure white (#FFFFFF) infinity cove, product only, no props, no models, no hands.
Product occupies 75–85% of frame, centered, front-facing or slight 3/4 view, full label legible.
Amazon main-image constraints are absolute: no text overlays, no watermarks, no environmental context.`,
    L2: `
[SCENE BLOCK — L2 SIZE & SCALE REFERENCE]
Scene: product shown with clear, readable size context for online buyers.
Use flat-lay with a familiar reference (coin, credit card, smartphone) OR worn/placed next to a ruler or tape measure.
Respect scale anchor: ${scaleAnchor}. Product must not appear enlarged beyond stated dimensions.
Background: white or very light neutral. Lighting: clean, even, product clearly legible.
TRIGGER ACTIVATION: remove size uncertainty for "${buyer}".`,
    L3: `
[SCENE BLOCK — L3 LIFESTYLE IN-CONTEXT]
Foreground (0–30% depth): one specific supporting prop that matches buyer context, no clutter.
Mid-ground (30–60% depth): product in natural use by ${buyer}, scale anchored to ${scaleAnchor}.
Background (60–100% depth): realistic environment with warm, natural light and clear depth.
COMPETITOR CONTRAST: avoid cliché "${antiPatterns[0]}"; differentiate via "${positioningGap}".
TRIGGER ACTIVATION: address buyer objection "${trigger}" through visible in-use proof and realistic scale.`,
    L4: `
[SCENE BLOCK — L4 TEXTURE & DETAIL]
Scene: extreme macro close-up focused on tactile quality and construction detail.
Show real material grain: ${intake.materials || analysis.materials}.
Controlled side-light to reveal depth and authenticity; no synthetic CGI smoothness.
COMPETITOR CONTRAST: avoid cliché "${antiPatterns[1] ?? antiPatterns[0]}"; prioritize premium material proof.`,
    L5: `
[SCENE BLOCK — L5 MOOD & ATMOSPHERE]
Scene: brand world and aspirational atmosphere — product may appear naturally but is not required.
Mood aligned with ${intake.vibe || analysis.mood}. Editorial, premium, category-appropriate environment.
Lighting: atmospheric — warm, dramatic, or minimal per brand positioning.
COMPETITOR CONTRAST: avoid "${antiPatterns[0]}"; own "${positioningGap}".`,
    L6: `
[SCENE BLOCK — L6 QUALITY CONSTRUCTION]
Scene: craftsmanship and hidden quality — seams, lining, hardware, cap mechanism, or cross-section detail.
Medium close-up revealing build quality beyond a standard pack shot.
Side-light to emphasize depth and assembly precision.
TRIGGER ACTIVATION: prove premium construction vs cheap alternatives.`,
    L7: `
[SCENE BLOCK — L7 FABRIC & MATERIAL CALLOUT]
Scene: material story told visually — swatch, key ingredient, composition callout, or certification badges integrated into composition.
Highlight: ${intake.materials || analysis.materials}. ${intake.keyFeatures || analysis.differentiators || "Key product claims"}.
Clinical precision for health/science categories; warm/earthy for natural products.
TRIGGER ACTIVATION: rational proof supporting emotional purchase.`,
    L8: `
[SCENE BLOCK — L8 PACKAGING & UNBOXING]
Scene: packaging and first-touch unboxing layout, clean and inviting.
Packaging branding must remain accurate and legible.
Props must be specific and minimal; visual focus stays on the product and included contents.
TRIGGER ACTIVATION: reduce uncertainty by clearly showing what arrives and product readiness.`,
    L9: `
[SCENE BLOCK — L9 BRAND STORY]
Scene: origin and provenance — workshop, farm, founder context, heritage, or cultural setting authentic to the brand.
Brand name visible and intentional. Warm, specific, not generic stock.
Mood: ${intake.vibe || analysis.mood}. Differentiate via "${positioningGap}".`,
    L10: `
[SCENE BLOCK — L10 COMPARISON / VERSUS]
Scene: our product clearly hero — larger, better lit, dominant left or foreground.
Generic/unbranded or secondary competitor product smaller or background; equal lighting treatment, fair comparison.
Visual hierarchy: quality gap immediately visible without manipulative lighting.
COMPETITOR CONTRAST: avoid "${antiPatterns[1] ?? antiPatterns[0]}".`,
    L11: `
[SCENE BLOCK — L11 LIFESTYLE ALTERNATE]
Scene: same product as L3 but meaningfully different context — outdoor vs indoor, different demographic, or result-state vs application.
Scale anchor: ${scaleAnchor}. Parallel quality bar to L3, not a lower-priority shot.
TRIGGER ACTIVATION: reach buyers who did not connect with the primary lifestyle angle.`,
    L12: `
[SCENE BLOCK — L12 LIFESTYLE ACTION]
Scene: active use — product mid-motion, application, consumption, or performance moment (not static still life).
Energetic lighting; slight motion feel acceptable. Product clearly visible during value delivery.
Scale anchor: ${scaleAnchor}. Buyer: ${buyer}.
TRIGGER ACTIVATION: create urgency and desire through action, not context alone.`,
  };

  const style = `
[STYLE & QUALITY ENFORCEMENT]
Authentic product photography — NOT CGI, NOT stylized render.
Camera & lens: Sony A7R V · FE 90mm Macro @ f/5.6 for detail fidelity.
Lighting: realistic commercial setup with natural highlight falloff and controlled shadows.
Mood: ${intake.vibe || analysis.mood}. Marketplace fit: ${marketplace.label}.
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
  const productBlock = productContextBlock(analysis, intake);
  const marketBlock = `Marketplace: ${marketplace.label}. ${marketplace.imageNote}`;
  const spotBlock = options?.spotEditHint
    ? `Spot edit instruction (apply to this regeneration only): ${options.spotEditHint}`
    : "";

  return [
    constraints.trim(),
    options?.playbookContext,
    options?.templateContext,
    brandBlock,
    productBlock,
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
  if (!dimensions || dimensions === "Unknown") return "roughly the size shown in the reference image";
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
