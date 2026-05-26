import Replicate from "replicate";
import { extractReplicateText, parseJsonFromModel } from "./replicate-output";
import { isStubMode, sleep } from "./utils";

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
}

const ANALYSIS_PROMPT = `Analyze this product image for Amazon listing generation. Return ONLY valid JSON:
{
  "productType": "type of product",
  "brandName": "brand on label or Unknown",
  "productName": "product name on label or Unknown",
  "materials": "visible materials/ingredients",
  "colors": "precise color description with hex if possible",
  "labelText": "literal transcription of all visible text on product",
  "mood": "3 words describing vibe",
  "amazonCategory": "Amazon category path",
  "keyObservations": "2-3 sentences for image prompt fidelity"
}`;

export async function analyzeProductImage(imageUrl: string): Promise<ProductAnalysis> {
  if (isStubMode()) {
    await sleep(1200);
    return {
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
    };
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const output = await replicate.run("google/gemini-3-flash", {
    input: {
      prompt: ANALYSIS_PROMPT,
      image: imageUrl,
      max_tokens: 900,
    },
  });

  const raw = extractReplicateText(output);
  const parsed = parseJsonFromModel<Partial<ProductAnalysis>>(raw);

  return {
    productType: parsed.productType ?? "Product",
    brandName: parsed.brandName ?? "Unknown",
    productName: parsed.productName ?? "Unknown",
    materials: parsed.materials ?? "Unknown",
    colors: parsed.colors ?? "Unknown",
    labelText: parsed.labelText ?? "",
    mood: parsed.mood ?? "premium",
    amazonCategory: parsed.amazonCategory ?? "General",
    keyObservations: parsed.keyObservations ?? "",
  };
}

export async function scoreImageQuality(
  imageUrl: string,
  moduleId: string
): Promise<number> {
  if (isStubMode()) {
    await sleep(400);
    return 8;
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const output = await replicate.run("google/gemini-3-flash", {
    input: {
      prompt: `Rate this Amazon listing module ${moduleId} image 1-10 for product fidelity, technical quality, and conversion appeal. Return ONLY one integer.`,
      image: imageUrl,
      max_tokens: 10,
    },
  });

  const score = parseInt(extractReplicateText(output).trim(), 10);
  return Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : 7;
}
