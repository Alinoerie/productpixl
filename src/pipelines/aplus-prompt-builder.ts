import type { ProductAnalysis } from "@/lib/ai";
import type { BrandProfileData } from "@/lib/brand-profile";
import { brandContextBlock } from "@/lib/brand-profile";
import type { ProductIntakeData } from "@/lib/product-intake";
import { getMarketplace } from "@/lib/marketplaces";
import type { AplusModuleId } from "./aplus-modules";
import type { ResearchSummary } from "./prompt-builder";

export type IntakeData = ProductIntakeData;

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

export function buildAplusPrompt(
  moduleId: AplusModuleId,
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
  const buyer = intake.targetBuyer || analysis.suggestedTargetBuyer || "target buyer";

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

  const scenes: Record<AplusModuleId, string> = {
    M1: `
[SCENE BLOCK — M1 HEADER WITH TEXT]
Scene: Aspirational brand hero — the visual communicates the brand's reason for being.
Product prominent, label legible, premium environment that sets tone for the entire A+ page.
Lighting: brand-appropriate — warm golden hour for natural/luxury, clean neutral for tech.
COMPETITOR CONTRAST: avoid "${antiPatterns[0]}"; own "${positioningGap}".
TRIGGER ACTIVATION: first impression for "${buyer}" — instant brand credibility.`,
    M2: `
[SCENE BLOCK — M2 IMAGE + TEXT]
Scene: ONE specific benefit shown visually — the most compelling claim the product makes.
Product prominent in the image portion (left side of module). Clean lighting flatters product and benefit claim.
Background supports the claim without clutter. Leave right-side text zone implied by composition balance.
TRIGGER ACTIVATION: address "${trigger}" through visible proof.`,
    M3: `
[SCENE BLOCK — M3 TEXT + IMAGE]
Scene: Benefit visual — same quality bar as M2 but image on the right side.
Scale anchor: ${scaleAnchor}. If human hand holds product, respect stated dimensions — do not enlarge.
Mid-ground product zone 30–60% depth; background aspirational but not busy.
TRIGGER ACTIVATION: rational proof supporting emotional purchase.`,
    M4: `
[SCENE BLOCK — M4 IMAGE GRID]
Scene: Grid of 4 cohesive vignettes — (1) product isolated, (2) texture/ingredient close-up,
(3) lifestyle context, (4) packaging or detail shot. Same lighting temperature and brand palette across cells.
COMPETITOR CONTRAST: avoid "${antiPatterns[1] ?? antiPatterns[0]}".`,
    M5: `
[SCENE BLOCK — M5 PRODUCT SHOWCASE]
Scene: 3–6 units arranged in composed still-life on category-appropriate surface (marble, linen, slate).
Soft even lighting, each unit clearly visible and properly spaced.
TRIGGER ACTIVATION: show line extension or multi-unit value.`,
    M6: `
[SCENE BLOCK — M6 COMPARISON CHART]
Scene: Hero product left, dominant and better lit. Comparison context right — generic alternative smaller or background.
Visual hierarchy: quality gap immediately visible without manipulative lighting.
COMPETITOR CONTRAST: avoid "${antiPatterns[0]}".`,
    M7: `
[SCENE BLOCK — M7 LARGE IMAGE + TEXT]
Scene: Most aspirational scenario the brand can claim — the moment the buyer wants to inhabit.
Leave right third relatively clear for text overlay potential. Scale anchor: ${scaleAnchor}.
Dramatic lighting — golden hour Rembrandt or clean editorial per category.
TRIGGER ACTIVATION: "${trigger}" via aspirational environment proof.`,
    M8: `
[SCENE BLOCK — M8 TECHNICAL SPECIFICATIONS]
Scene: Product flat or slightly angled on neutral white/slate surface, label and specs legible.
Clinical, premium pharmacy or laboratory aesthetic. Exact color reproduction — trust signal.
TRIGGER ACTIVATION: rational credibility for "${buyer}".`,
    M9: `
[SCENE BLOCK — M9 HOTSPOT IMAGE]
Scene: Product front-facing or 3/4 angle with surrounding space for hotspot callout labels.
Infinity cove or shallow depth-of-field environmental background — no competing elements.
All key features visible from this angle.`,
    M10: `
[SCENE BLOCK — M10 CATEGORY NAVIGATION]
Scene: Product in natural use environment with complementary context suggesting related categories.
Aspirational but relatable — shopper thinks "I need that too."
Scale anchor: ${scaleAnchor}.`,
    M11: `
[SCENE BLOCK — M11 FAQ VISUAL]
Scene: Macro image communicating ingredient transparency and trust — raw active ingredient or formula texture.
Backlit or side-lit to reveal depth. Very dark or very light background — no competing elements.
Visual trust signal backing FAQ answers — no text in scene.`,
    M12: `
[SCENE BLOCK — M12 VIDEO HERO FRAME]
Scene: Product mid-action or most impactful moment of use — single frame that tells the whole story.
Dynamic lighting suggests movement. Scale anchor: ${scaleAnchor}.
TRIGGER ACTIVATION: urgency and desire through action moment.`,
    M13: `
[SCENE BLOCK — M13 SHOPPABLE IMAGE]
Scene: Full lifestyle scene — curated nightstand, kitchen counter, or category environment.
Product at home in scene with clear focal points for hotspot placements. Scale anchor: ${scaleAnchor}.
COMPETITOR CONTRAST: avoid "${antiPatterns[2] ?? antiPatterns[0]}".`,
    M14: `
[SCENE BLOCK — M14 CARD CAROUSEL]
Scene: Self-contained story chapter — hero moment, key benefit, lifestyle, or ingredient close-up.
Consistent lighting temperature and color grading with other carousel cards.
Narrative arc: setting → product → sensory detail → aspirational payoff.`,
    M15: `
[SCENE BLOCK — M15 SHOPPABLE LOOKBOOK]
Scene: Cinematic editorial spread — establishing context, product reveal, sensory close-up, human moment.
Premium lifestyle magazine quality. Scale anchor: ${scaleAnchor}.
Lighting cohesive throughout, dramatic but controlled.`,
  };

  const modSpec =
    moduleId === "M7" || moduleId === "M12" || moduleId === "M13" || moduleId === "M14" || moduleId === "M15"
      ? "1500×600px @ 144 DPI (2.5:1)"
      : moduleId === "M2" || moduleId === "M3" || moduleId === "M8" || moduleId === "M10"
        ? "970×300px @ 144 DPI (crop from 16:9)"
        : "970×600px @ 144 DPI";

  const style = `
[STYLE & QUALITY ENFORCEMENT]
Authentic product photography — NOT CGI, NOT stylized render.
Camera & lens: Sony A7R V · FE 90mm Macro @ f/5.6 for detail fidelity.
Lighting: realistic commercial setup with natural highlight falloff and controlled shadows.
Mood: ${intake.vibe || analysis.mood}. Marketplace fit: ${marketplace.label}.
Amazon A+ module standard. Target output: ${modSpec}.`;

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
