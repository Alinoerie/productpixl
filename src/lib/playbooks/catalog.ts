export type PlaybookCategory =
  | "amazon"
  | "lifestyle"
  | "ugc"
  | "shopify"
  | "tiktok"
  | "aplus"
  | "infographic"
  | "furniture";

export type PlaybookDefinition = {
  slug: string;
  title: string;
  subtitle: string;
  category: PlaybookCategory;
  channel: string;
  creditHint: string;
  promptFocus: string;
};

export const PLAYBOOK_CATALOG: PlaybookDefinition[] = [
  {
    slug: "amazon-main-images",
    title: "Amazon Main Images",
    subtitle: "Proven to boost CTR by up to 300%",
    category: "amazon",
    channel: "Amazon",
    creditHint: "4–8 credits per SKU",
    promptFocus: "Hero-first main image stack with benefit callouts, comparison frames, and trust badges tuned for Amazon CTR.",
  },
  {
    slug: "lifestyle",
    title: "Lifestyle",
    subtitle: "Bring your product to life and improve add-to-cart by up to 3×",
    category: "lifestyle",
    channel: "Amazon · Shopify",
    creditHint: "6–12 credits per SKU",
    promptFocus: "Authentic in-use lifestyle scenes with natural light, credible models, and category-appropriate environments.",
  },
  {
    slug: "ugc",
    title: "UGC",
    subtitle: "Social-proof visuals that do the selling for you",
    category: "ugc",
    channel: "Amazon · TikTok",
    creditHint: "5–10 credits per SKU",
    promptFocus: "UGC-style handheld shots, unboxing moments, and testimonial overlays without looking staged.",
  },
  {
    slug: "shopify",
    title: "Shopify",
    subtitle: "High-converting hero, lifestyle, and studio shots",
    category: "shopify",
    channel: "Shopify",
    creditHint: "8–14 credits per SKU",
    promptFocus: "PDP gallery mix: clean hero, detail macro, lifestyle, and size-context frames for DTC conversion.",
  },
  {
    slug: "tiktok-shop",
    title: "TikTok Shop",
    subtitle: "Complete PDP gallery — studio, lifestyle, in-use, aesthetic, and more",
    category: "tiktok",
    channel: "TikTok Shop",
    creditHint: "10–16 credits per SKU",
    promptFocus: "Scroll-stopping vertical-friendly crops, bold hooks, and trend-aware styling for TikTok commerce.",
  },
  {
    slug: "supplements-aplus",
    title: "Supplements Listing with A+",
    subtitle: "Built on insights from high-converting Supplements listings on Amazon",
    category: "aplus",
    channel: "Amazon A+",
    creditHint: "12–20 credits per SKU",
    promptFocus: "Compliance-aware supplement storytelling: ingredients, dosage clarity, trust seals, and comparison modules.",
  },
  {
    slug: "beauty-aplus",
    title: "Beauty & Personal Care Listing with A+",
    subtitle: "Top-performing beauty & personal care patterns from Amazon",
    category: "aplus",
    channel: "Amazon A+",
    creditHint: "12–20 credits per SKU",
    promptFocus: "Texture swatches, before/after frames, shade charts, and clean beauty claims layout.",
  },
  {
    slug: "food-beverage-aplus",
    title: "Food and Beverage Listing with A+",
    subtitle: "Proven formula from top Food & Beverage listings on Amazon",
    category: "aplus",
    channel: "Amazon A+",
    creditHint: "12–20 credits per SKU",
    promptFocus: "Appetite appeal, serving suggestions, nutrition highlights, and pantry/lifestyle context.",
  },
  {
    slug: "medicube-infographics",
    title: "Medicube Inspired Infographics",
    subtitle: "Main image + gallery set shaped by Medicube's best listings",
    category: "infographic",
    channel: "Amazon",
    creditHint: "8–14 credits per SKU",
    promptFocus: "K-beauty infographic layouts: step routines, ingredient highlights, and clinical-style badges.",
  },
  {
    slug: "lemme-infographics",
    title: "Lemme Inspired Infographics",
    subtitle: "High-converting Amazon main and gallery images inspired by Lemme",
    category: "infographic",
    channel: "Amazon",
    creditHint: "8–14 credits per SKU",
    promptFocus: "Playful wellness infographic system with bold typography blocks and benefit stacks.",
  },
  {
    slug: "furniture-lifestyle",
    title: "Furniture Lifestyle",
    subtitle: "Lifestyle visuals shoppers trust almost 3× more than plain white shots",
    category: "furniture",
    channel: "Amazon · Shopify",
    creditHint: "10–18 credits per SKU",
    promptFocus: "Room-scale lifestyle, scale references, material close-ups, and aspirational but believable interiors.",
  },
];

export function getPlaybook(slug: string) {
  return PLAYBOOK_CATALOG.find((p) => p.slug === slug);
}

export function playbookContextBlock(playbook: PlaybookDefinition, brandName: string): string {
  return [
    "Expert playbook:",
    `— Playbook: ${playbook.title}`,
    `— Channel: ${playbook.channel}`,
    `— Objective: ${playbook.subtitle}`,
    `— Creative direction: ${playbook.promptFocus}`,
    `— Brand: ${brandName} — apply brand palette, tone, and typography to every module.`,
    "Run this playbook consistently across the selected catalog SKUs.",
  ].join("\n");
}
