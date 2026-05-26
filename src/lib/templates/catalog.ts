export type TemplateCategory =
  | "aplus"
  | "infographic"
  | "lifestyle"
  | "studio"
  | "ugc"
  | "shopify"
  | "tiktok"
  | "comparison";

export type VisualTemplate = {
  slug: string;
  title: string;
  description: string;
  category: TemplateCategory;
  channel: string;
  hasText: boolean;
  industry: string;
  format: "square" | "portrait" | "landscape";
  tags: string[];
};

export const VISUAL_TEMPLATE_CATALOG: VisualTemplate[] = [
  {
    slug: "amazon-hero-benefit-stack",
    title: "Hero benefit stack",
    description: "Main image with three benefit callouts and brand color accents.",
    category: "infographic",
    channel: "Amazon",
    hasText: true,
    industry: "General",
    format: "square",
    tags: ["main image", "benefits", "ctr"],
  },
  {
    slug: "aplus-ingredient-grid",
    title: "A+ ingredient grid",
    description: "Six-tile ingredient story with icons and short claims.",
    category: "aplus",
    channel: "Amazon A+",
    hasText: true,
    industry: "Supplements",
    format: "landscape",
    tags: ["ingredients", "compliance", "story"],
  },
  {
    slug: "beauty-texture-swatch",
    title: "Texture swatch board",
    description: "Macro texture + shade lineup for beauty PDP modules.",
    category: "aplus",
    channel: "Amazon A+",
    hasText: false,
    industry: "Beauty",
    format: "landscape",
    tags: ["texture", "shade", "macro"],
  },
  {
    slug: "lifestyle-morning-ritual",
    title: "Morning ritual scene",
    description: "Soft natural light lifestyle with product in authentic use.",
    category: "lifestyle",
    channel: "Amazon · Shopify",
    hasText: false,
    industry: "Wellness",
    format: "landscape",
    tags: ["lifestyle", "natural light"],
  },
  {
    slug: "ugc-unboxing-handheld",
    title: "UGC unboxing frame",
    description: "Handheld POV unboxing with social-proof caption area.",
    category: "ugc",
    channel: "TikTok · Amazon",
    hasText: true,
    industry: "General",
    format: "portrait",
    tags: ["ugc", "unboxing"],
  },
  {
    slug: "shopify-pdp-hero-trio",
    title: "Shopify PDP hero trio",
    description: "Hero + detail + scale reference for DTC product pages.",
    category: "shopify",
    channel: "Shopify",
    hasText: false,
    industry: "General",
    format: "square",
    tags: ["pdp", "hero", "scale"],
  },
  {
    slug: "tiktok-hook-frame",
    title: "TikTok hook frame",
    description: "Bold headline zone + product focus for scroll-stopping PDP crops.",
    category: "tiktok",
    channel: "TikTok Shop",
    hasText: true,
    industry: "General",
    format: "portrait",
    tags: ["hook", "vertical"],
  },
  {
    slug: "furniture-room-scale",
    title: "Furniture room scale",
    description: "Full room context with dimension cues and material close-up inset.",
    category: "lifestyle",
    channel: "Amazon · Shopify",
    hasText: false,
    industry: "Furniture",
    format: "landscape",
    tags: ["furniture", "scale", "interior"],
  },
  {
    slug: "comparison-vs-generic",
    title: "Us vs generic comparison",
    description: "Split comparison module highlighting differentiators.",
    category: "comparison",
    channel: "Amazon",
    hasText: true,
    industry: "General",
    format: "landscape",
    tags: ["comparison", "differentiators"],
  },
  {
    slug: "studio-white-minimal",
    title: "Studio white minimal",
    description: "Clean studio product on white with soft shadow — no text.",
    category: "studio",
    channel: "Amazon · Bol",
    hasText: false,
    industry: "General",
    format: "square",
    tags: ["studio", "white background"],
  },
  {
    slug: "food-serving-suggestion",
    title: "Food serving suggestion",
    description: "Appetite appeal layout with serving context and nutrition callouts.",
    category: "aplus",
    channel: "Amazon A+",
    hasText: true,
    industry: "Food & Beverage",
    format: "landscape",
    tags: ["food", "serving", "nutrition"],
  },
  {
    slug: "k-beauty-step-routine",
    title: "K-beauty step routine",
    description: "Numbered routine steps with product placement per Medicube-style layouts.",
    category: "infographic",
    channel: "Amazon",
    hasText: true,
    industry: "Beauty",
    format: "square",
    tags: ["k-beauty", "routine", "steps"],
  },
];

export const TEMPLATE_FILTER_OPTIONS = {
  categories: ["all", "aplus", "infographic", "lifestyle", "studio", "ugc", "shopify", "tiktok", "comparison"] as const,
  channels: ["all", "Amazon", "Amazon A+", "Shopify", "TikTok Shop", "TikTok · Amazon", "Amazon · Shopify", "Amazon · Bol"],
  industries: ["all", "General", "Beauty", "Supplements", "Food & Beverage", "Furniture", "Wellness"],
  text: ["all", "with-text", "no-text"] as const,
};

export function getVisualTemplate(slug: string) {
  return VISUAL_TEMPLATE_CATALOG.find((t) => t.slug === slug);
}

export function templateContextBlock(template: VisualTemplate, brandName: string): string {
  return [
    "Visual template base:",
    `— Template: ${template.title}`,
    `— Layout: ${template.description}`,
    `— Channel: ${template.channel}`,
    template.hasText
      ? "— Replace placeholder text with this product's benefits while keeping layout structure."
      : "— No text overlay — focus on composition, lighting, and brand palette.",
    `— Recolor accents to ${brandName} brand palette; swap product and claims only.`,
  ].join("\n");
}
