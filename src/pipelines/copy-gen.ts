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

const BACKEND_KEYWORD_MAX_BYTES = 250;

export type CopyLocale = "en" | "de" | "nl" | "fr";

/** Map marketplace id → customer-facing copy locale. */
export function localeForMarketplace(marketplace: string): CopyLocale {
  if (marketplace === "AMAZON_DE") return "de";
  if (marketplace === "BOL_NL") return "nl";
  if (marketplace === "AMAZON_FR") return "fr";
  return "en";
}

function localeInstructions(locale: CopyLocale, marketplace: string): string {
  switch (locale) {
    case "de":
      return `Write ALL customer-facing copy in German (Deutsch). Formal "Sie" tone for Amazon DE. Metric units. EU compliance tone — no unsubstantiated health claims.`;
    case "nl":
      return `Write ALL customer-facing copy in Dutch (Nederlands) for Bol.com. Direct, trustworthy, less US marketing hype. Use metric units. Bol prefers factual benefits over superlatives.`;
    case "fr":
      return `Write ALL customer-facing copy in French (Français). Elegant, precise product language suitable for Amazon FR / EU shoppers. Metric units.`;
    default:
      if (marketplace === "AMAZON_UK") {
        return "Write in UK English (colour, metre, organise).";
      }
      return "Write in US English unless otherwise specified.";
  }
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function trimBackendKeywordsToBytes(keywords: string, maxBytes = BACKEND_KEYWORD_MAX_BYTES): string {
  const parts = keywords.split(",").map((p) => p.trim()).filter(Boolean);
  const kept: string[] = [];
  let total = 0;
  for (const part of parts) {
    const addition = (kept.length ? 2 : 0) + byteLength(part);
    if (total + addition > maxBytes) break;
    kept.push(part);
    total += addition;
  }
  return kept.join(", ");
}

async function parseAndValidateCopy(
  raw: string,
  replicate: Replicate,
  system: string,
  user: string,
  maxAttempts = 3
): Promise<ListingCopyOutput> {
  let parsed = listingCopySchema.parse(parseJsonFromModel(raw));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (byteLength(parsed.backendKeywords) <= BACKEND_KEYWORD_MAX_BYTES) {
      return parsed;
    }
    parsed = {
      ...parsed,
      backendKeywords: trimBackendKeywordsToBytes(parsed.backendKeywords),
    };
    if (byteLength(parsed.backendKeywords) <= BACKEND_KEYWORD_MAX_BYTES) {
      return parsed;
    }

    const regen = await replicate.run("google/gemini-3-flash", {
      input: {
        prompt: `${system}\n\nProduct data:\n${user}\n\nPrevious backendKeywords exceeded 250 bytes. Regenerate ONLY backendKeywords as comma-separated terms, max 250 bytes total. Return JSON: { "backendKeywords": "..." }`,
        max_tokens: 400,
      },
    });
    const regenRaw = extractReplicateText(regen);
    const regenParsed = parseJsonFromModel(regenRaw) as { backendKeywords?: string };
    if (regenParsed.backendKeywords) {
      parsed = { ...parsed, backendKeywords: regenParsed.backendKeywords };
    }
  }

  return {
    ...parsed,
    backendKeywords: trimBackendKeywordsToBytes(parsed.backendKeywords),
  };
}

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
  playbooksContext?: string;
}): Promise<ListingCopyOutput> {
  const locale = localeForMarketplace(params.marketplace);
  const localeBlock = localeInstructions(locale, params.marketplace);

  if (isStubMode()) {
    await sleep(1500);
    const suffix = locale === "de" ? " — Premium Qualität" : locale === "nl" ? " — Premium kwaliteit" : locale === "fr" ? " — Qualité premium" : "";
    return {
      title: `${params.brandName} ${params.productName}${suffix}`.slice(0, 200),
      bullets: [
        `Crafted for ${params.targetBuyer ?? "discerning buyers"} who expect visible quality.`,
        `Key materials: ${params.materials ?? "premium components"} — built to perform daily.`,
        `${params.keyFeatures ?? "Designed for reliable results"} without compromise.`,
        `Optimized listing keywords: ${params.keywords.slice(0, 4).join(", ")}.`,
        `Ships ready for ${params.marketplace.replace("_", " ")} — publish with confidence.`,
      ],
      description: `${params.brandName} ${params.productName} delivers the quality your customers expect on ${params.marketplace.replace("_", " ")}. ${params.analysisSummary ?? ""}`.trim(),
      backendKeywords: trimBackendKeywordsToBytes(params.keywords.slice(0, 8).join(", ")),
    };
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  const brandBlock = params.brandProfile ? `\n${brandContextBlock(params.brandProfile)}` : "";
  const playbookBlock = params.playbooksContext ? `\n${params.playbooksContext}` : "";
  const system = `You are a marketplace listing copywriter for ${params.marketplace}.
${localeBlock}
Optimize for Amazon A9 keyword relevance AND semantic/RUFUS-style discovery (benefit-led, answer shopper questions in bullets).
Return ONLY valid JSON: { "title": string (max 200 chars), "bullets": [5 strings], "description": string, "backendKeywords": string (comma-separated, max 250 BYTES not characters) }
Follow marketplace policy: no promotional claims, no competitor names, factual benefits.
backendKeywords MUST fit within 250 bytes when UTF-8 encoded.${brandBlock}${playbookBlock}`;

  const user = JSON.stringify({
    product: params.productName,
    brand: params.brandName,
    category: params.category,
    locale,
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
  return parseAndValidateCopy(raw, replicate, system, user);
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
