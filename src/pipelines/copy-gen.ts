import Replicate from "replicate";
import { z } from "zod";
import { extractReplicateText, parseJsonFromModel } from "@/lib/replicate-output";
import { isStubMode, sleep } from "@/lib/utils";
import { brandContextBlock, type BrandProfileData } from "@/lib/brand-profile";

export const listingCopySchema = z.object({
  title: z.string().max(200),
  bullets: z.array(z.string().max(500)).length(5),
  description: z.string().max(2000),
  backendKeywords: z.string().max(250),
});

export type ListingCopyOutput = z.infer<typeof listingCopySchema>;

export async function generateListingCopy(params: {
  productName: string;
  brandName: string;
  category: string;
  marketplace: string;
  materials?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  competitors?: string;
  analysisSummary?: string;
  researchSnippets: string[];
  keywords: string[];
  competitorTitles: string[];
  brandProfile?: BrandProfileData;
}): Promise<ListingCopyOutput> {
  if (isStubMode()) {
    await sleep(1500);
    return {
      title: `${params.brandName} ${params.productName} — Premium ${params.category.split(">").pop()?.trim() ?? "Quality"}`,
      bullets: [
        `Crafted for ${params.targetBuyer ?? "discerning buyers"} who expect visible quality.`,
        `Key materials: ${params.materials ?? "premium components"} — built to perform daily.`,
        `${params.keyFeatures ?? "Designed for reliable results"} without compromise.`,
        `Optimized listing keywords: ${params.keywords.slice(0, 4).join(", ")}.`,
        `Ships ready for ${params.marketplace.replace("_", " ")} — publish with confidence.`,
      ],
      description: `${params.brandName} ${params.productName} delivers the quality your customers expect on ${params.marketplace.replace("_", " ")}. ${params.analysisSummary ?? ""}`.trim(),
      backendKeywords: params.keywords.slice(0, 8).join(", "),
    };
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const isBol = params.marketplace === "BOL_NL";
  const brandBlock = params.brandProfile ? `\n${brandContextBlock(params.brandProfile)}` : "";
  const system = `You are a marketplace listing copywriter for ${params.marketplace}.
Write in English unless marketplace is BOL_NL (then Dutch is preferred for customer-facing copy).
Optimize for Amazon A9 keyword relevance AND semantic/RUFUS-style discovery (benefit-led, answer shopper questions in bullets).
Return ONLY valid JSON: { "title": string (max 200 chars), "bullets": [5 strings], "description": string, "backendKeywords": string (comma-separated, max 250 bytes) }
Follow marketplace policy: no promotional claims, no competitor names, factual benefits.
${isBol ? "Bol.com tone: direct, trustworthy, less aggressive US marketing hype." : ""}${brandBlock}`;

  const user = JSON.stringify({
    product: params.productName,
    brand: params.brandName,
    category: params.category,
    materials: params.materials,
    features: params.keyFeatures,
    buyer: params.targetBuyer,
    vibe: params.vibe,
    useCase: params.useCase,
    differentiators: params.differentiators,
    competitorsToAvoid: params.competitors,
    analysis: params.analysisSummary,
    keywords: params.keywords,
    competitors: params.competitorTitles,
    research: params.researchSnippets.slice(0, 3),
  });

  const output = await replicate.run("google/gemini-3-flash", {
    input: {
      prompt: `${system}\n\nProduct data:\n${user}`,
      max_tokens: 1200,
    },
  });

  const raw = extractReplicateText(output);
  const parsed = parseJsonFromModel(raw);
  return listingCopySchema.parse(parsed);
}

export type CopySectionId = "title" | "bullet" | "description" | "keywords";

export async function generateListingCopySection(params: {
  section: CopySectionId;
  bulletIndex?: number;
  productName: string;
  brandName: string;
  category: string;
  marketplace: string;
  existing: Partial<ListingCopyOutput>;
  materials?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  keywords?: string[];
}): Promise<string | string[]> {
  const full = await generateListingCopy({
    productName: params.productName,
    brandName: params.brandName,
    category: params.category,
    marketplace: params.marketplace,
    materials: params.materials,
    keyFeatures: params.keyFeatures,
    targetBuyer: params.targetBuyer,
    researchSnippets: [],
    keywords: params.keywords ?? [],
    competitorTitles: [],
  });

  switch (params.section) {
    case "title":
      return full.title;
    case "description":
      return full.description;
    case "keywords":
      return full.backendKeywords;
    case "bullet": {
      const idx = params.bulletIndex ?? 0;
      return full.bullets[idx] ?? full.bullets[0] ?? "";
    }
    default:
      return full.title;
  }
}
