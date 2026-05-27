/**
 * ProductPixl market positioning — single source for hero copy, pillars, and competitor contrast.
 *
 * True USP (2026): We own the moment *before* a listing exists — one photo → research-backed
 * gallery + copy — with pay-when-you-generate economics. Catalog-sync tools start from SKUs;
 * we start from your product shot.
 */

export const USP_TAGLINE = "AI listing studio for Amazon sellers" as const;

export const USP_HEADLINE = "Stop waiting 3 weeks for listing photos that cost €2,000." as const;

export const USP_SUBHEAD =
  "Upload one product photo. Get 12 gallery images, A+ modules, and marketplace copy in under 3 minutes — 20× cheaper than a photo shoot, with no monthly subscription." as const;

/** One sentence for meta, OG, and footers */
export const USP_ONE_LINER =
  "Photo-first AI listing studio: gallery images + marketplace copy from one photo, pay only when you generate." as const;

export type UspPillar = {
  id: string;
  title: string;
  body: string;
  /** How to leverage this in GTM */
  leverage: string;
};

/** What we uniquely combine — competitors typically offer 1–2 of these, not all five */
export const USP_PILLARS: UspPillar[] = [
  {
    id: "photo-first",
    title: "Photo-first, not catalog-first",
    body: "Start from one product image — ideal for new launches, private label, and Bol.com before the ASIN exists.",
    leverage:
      "Lead every funnel (login, grader, ads) with “no ASIN required.” Target pre-revenue sellers and EU launches competitors ignore.",
  },
  {
    id: "full-studio",
    title: "Gallery + copy in one studio",
    body: "Hero, lifestyle, and detail modules plus listing title, bullets, and description — not a text-only sidecar or image-only tool.",
    leverage:
      "Contrast Perci (copy) and photoshoot agencies in one breath. Show before/after mosaic on every landing surface.",
  },
  {
    id: "research-backed",
    title: "Research-backed, not generic AI",
    body: "Category intelligence runs before generation. You review and edit prompts before anything renders — listing-specific, not ChatGPT boilerplate.",
    leverage:
      "Demo the prompt-review step in sales calls. Position against “paste into ChatGPT” with QA depth and marketplace modules (L1/L3/L4).",
  },
  {
    id: "pay-per-run",
    title: "Pay when you generate",
    body: "Credits — not a monthly listing cap. Idle months cost nothing. Quote shown before every image or copy run.",
    leverage:
      "Win 10–200 SKU sellers who hate subscription guilt. Pricing page leads with Free → packs → optional monthly later.",
  },
  {
    id: "amazon-eu",
    title: "Amazon + Europe native",
    body: "Bol.com tone, EU export packs, and RUFUS-ready copy structure — not a US-only afterthought.",
    leverage:
      "Own 'Bol.com from one photo' in SEO and marketplaces page. Grader hooks semantic search (RUFUS/COSMO) for trust.",
  },
  {
    id: "product-fidelity",
    title: "Your product, pixel-perfect",
    body: "Shape, label text, and colors are preserved in every generated scene. We never warp or hallucinate a different product.",
    leverage:
      "Lead trust message at upload step and in compare table. Counter WizStudio and midjourney fear of AI replacing the product with a different one.",
  },
];

export const USP_VS_MARKET = {
  catalogSyncTools: {
    label: "Catalog-sync AI (e.g. ButterflAI)",
    weaknesses: [
      "Starts from existing store SKUs — not pre-listing creative",
      "Monthly subscription + platform lock-in",
      "Strong on bulk SEO text — weaker on photo-first launches",
    ],
  },
  asinTools: {
    label: "ASIN-first suites (e.g. Pixii)",
    weaknesses: [
      "$200+/mo before you ship your first SKU",
      "Requires a live Amazon listing to begin",
      "Often copy-heavy without gallery generation from one photo",
    ],
  },
  genericAi: {
    label: "Generic AI (ChatGPT, etc.)",
    weaknesses: [
      "No category research or listing modules",
      "No gallery pipeline or export packs",
      "No credit quote or marketplace-specific QA",
    ],
  },
  productPixl: {
    label: "ProductPixl",
    strengths: [
      "One photo in — launch before the listing exists",
      "Images + copy + export in one account",
      "Credits with upfront quote — no subscription required",
      "Prompt review + category research before generate",
      "Amazon, Bol.com, and EU marketplace exports",
      "Product fidelity — shape, label, and colors preserved in every image",
    ],
  },
} as const;

/** Short proof chips for heroes and login */
export const USP_PROOF_CHIPS = [
  "No ASIN required",
  "Images + copy together",
  "Quote before you run",
  "10 free credits",
  "Bol.com & Amazon",
] as const;

/** Stats row — aligned to USP */
export const USP_STATS = [
  { value: "< 3 min", label: "Not a 3-week shoot" },
  { value: "20×", label: "Cheaper than a studio day" },
  { value: "12 images", label: "From 1 product photo" },
  { value: "€0 to start", label: "10 free credits, no subscription" },
] as const;

export const USP_LEVERAGE_PLAYS = [
  {
    title: "Free tools → studio",
    body: "Listing grader, guide pack, and demo booking all reinforce the same story: fix copy free, then generate the full listing from one photo.",
  },
  {
    title: "Show the prompt review moment",
    body: "Our defensible step vs generic AI — sellers see listing-specific prompts before spend. Use in demos, gallery captions, and compare page.",
  },
  {
    title: "Export as the finish line",
    body: "Bol.com / Shopify export packs prove we’re built for publish, not just generation. Pair with “launch before you list” on project pages.",
  },
  {
    title: "Credit honesty",
    body: "Never hide run cost. Sporadic sellers choose us over subscription tools when idle months are free and packs match real SKU cadence.",
  },
] as const;

export const USP_CTA = {
  primary: { label: "Start free — 10 credits", href: "/login" },
  secondary: { label: "Grade your listing free", href: "/grader" },
  demo: { label: "Book a demo", href: "/demo" },
  guide: { label: "Free guide pack", href: "/guides/ecommerce" },
} as const;
