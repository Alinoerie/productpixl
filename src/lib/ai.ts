import Replicate from "replicate";
import { extractReplicateText, parseJsonFromModel } from "./replicate-output";
import { isStubMode, sleep } from "./utils";
import type { BrandProfileData } from "./brand-profile";

export interface ProductAnalysis {
  productType: string;
  brandName: string;
  productName: string;
  materials: string;
  colors: string;
  labelText: string;
  mood: string;
  amazonCategory: string;
  keyObservations: string;
  dimensions: string;
  suggestedTargetBuyer: string;
  useCase: string;
  differentiators: string;
  /** Set when analysis was run — used to skip stale vision results. */
  _sourceImageUrl?: string;
}

const ANALYSIS_PROMPT = `Analyze this product image for Amazon/Bol marketplace listing generation.
Return ONLY valid JSON with these fields:
{
  "productType": "type of product",
  "brandName": "brand on label or Unknown",
  "productName": "product name on label or descriptive name",
  "materials": "visible materials/ingredients",
  "colors": "precise color description with hex if possible",
  "labelText": "literal transcription of all visible text on product",
  "mood": "3-word vibe describing aesthetic",
  "amazonCategory": "Amazon category path",
  "keyObservations": "2-3 sentences for image prompt fidelity",
  "dimensions": "estimated size/dimensions from packaging or context, or Unknown",
  "suggestedTargetBuyer": "who buys this product",
  "useCase": "primary use case in one sentence",
  "differentiators": "what makes this product visually distinct vs generic alternatives"
}`;

async function runGeminiVision(
  prompt: string,
  imageUrls: string | string[],
  maxTokens: number
): Promise<string> {
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const inputAttempts: Record<string, unknown>[] = [
    { prompt, images: urls, max_tokens: maxTokens },
    { prompt, image_input: urls, max_tokens: maxTokens },
    ...(urls.length === 1 ? [{ prompt, image: urls[0], max_tokens: maxTokens }] : []),
  ];

  let lastError: unknown;
  for (const input of inputAttempts) {
    try {
      const output = await replicate.run("google/gemini-3-flash", { input });
      const text = extractReplicateText(output).trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Vision model failed to analyze image");
}

function normalizeAnalysis(parsed: Partial<ProductAnalysis>): ProductAnalysis {
  return {
    productType: parsed.productType ?? "Product",
    brandName: parsed.brandName ?? "Unknown",
    productName: parsed.productName ?? "Unknown",
    materials: parsed.materials ?? "Unknown",
    colors: parsed.colors ?? "Unknown",
    labelText: parsed.labelText ?? "",
    mood: parsed.mood ?? "premium, clean, trustworthy",
    amazonCategory: parsed.amazonCategory ?? "General",
    keyObservations: parsed.keyObservations ?? "",
    dimensions: parsed.dimensions ?? "Unknown",
    suggestedTargetBuyer: parsed.suggestedTargetBuyer ?? "",
    useCase: parsed.useCase ?? "",
    differentiators: parsed.differentiators ?? "",
  };
}

export async function analyzeProductImage(imageUrl: string): Promise<ProductAnalysis> {
  if (isStubMode()) {
    await sleep(1200);
    return normalizeAnalysis({
      productType: "Premium consumer product",
      brandName: "Demo Brand",
      productName: "Demo Product",
      materials: "Mixed premium materials",
      colors: "Neutral charcoal #2D2D2D with accent details",
      labelText: "DEMO BRAND — Premium Product",
      mood: "clean, premium, trustworthy",
      amazonCategory: "Beauty & Personal Care > Skin Care",
      keyObservations:
        "Professional packshot. Label legible. Suitable for white-background hero and lifestyle contexts.",
      dimensions: "Approx. 500ml bottle, palm-sized",
      suggestedTargetBuyer: "Health-conscious households",
      useCase: "Daily personal care routine",
      differentiators: "Amber bottle, minimalist label, premium material cues",
    });
  }

  const raw = await runGeminiVision(ANALYSIS_PROMPT, imageUrl, 1200);
  const parsed = parseJsonFromModel<Partial<ProductAnalysis>>(raw);
  const analysis = normalizeAnalysis(parsed);
  return { ...analysis, _sourceImageUrl: imageUrl };
}

export async function generateBrandStory(profile: BrandProfileData): Promise<string> {
  if (isStubMode()) {
    await sleep(1500);
    const name = profile.displayName || profile.companyName || "Your brand";
    return `${name} creates ${profile.targetAudience ? `products for ${profile.targetAudience}` : "marketplace-ready products"} with a ${profile.tone} voice. Every listing image and copy line should feel cohesive, credible, and conversion-focused — never generic stock-brand energy.`;
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const prompt = `Write a concise brand story (120-180 words) for marketplace listing generation.
Use this profile:
${JSON.stringify(
    {
      companyName: profile.companyName,
      companyDescription: profile.companyDescription,
      displayName: profile.displayName,
      targetAudience: profile.targetAudience,
      tone: profile.tone,
      primaryColor: profile.primaryColor,
      secondaryColor: profile.secondaryColor,
      guidelines: profile.guidelines,
    },
    null,
    2
  )}

Return ONLY the brand story paragraph(s). No JSON, no headings. Focus on: who the brand serves, what it stands for, visual/copy personality, and what to avoid in generated assets.`;

  const output = await replicate.run("google/gemini-3-flash", {
    input: { prompt, max_tokens: 500 },
  });

  return extractReplicateText(output).trim();
}

export async function scoreImageQuality(
  imageUrl: string,
  moduleId: string,
  referenceImageUrl?: string
): Promise<number> {
  if (isStubMode()) {
    await sleep(400);
    return 8;
  }

  const prompt = referenceImageUrl
    ? `Compare the GENERATED Amazon listing image (image 1) to the ORIGINAL product photo (image 2) for module ${moduleId}.
Score 1-10 for product fidelity: same product, label text, colors, shape, and branding must match the reference.
Penalize product replacement, label drift, or wrong colors. Also consider technical quality and conversion appeal.
Return ONLY one integer.`
    : `Rate this Amazon listing module ${moduleId} image 1-10 for product fidelity, technical quality, and conversion appeal. Return ONLY one integer.`;

  const images = referenceImageUrl ? [imageUrl, referenceImageUrl] : [imageUrl];
  const raw = await runGeminiVision(prompt, images, 10);

  const score = parseInt(raw.trim(), 10);
  return Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : 7;
}
