export type GuidePlaybook = {
  id: string;
  title: string;
  summary: string;
  originalPriceEur: number;
  highlight?: boolean;
};

export const ECOMMERCE_GUIDE_PLATFORMS = [
  "Shopify",
  "WooCommerce",
  "PrestaShop",
  "LogiCommerce",
] as const;

export const ECOMMERCE_GUIDE_BENEFITS = [
  {
    title: "AI-generated catalog content",
    body: "Turn product data into titles, descriptions, and metadata that are ready to publish.",
  },
  {
    title: "Built for thousands of SKUs",
    body: "Work in bulk across large stores without losing brand consistency or editorial control.",
  },
  {
    title: "More visibility and conversion",
    body: "Align listings with search intent, SEO, GEO, and relevant attributes by category.",
  },
] as const;

/** Ten playbooks included in the free ecommerce optimization guide pack. */
export const ECOMMERCE_GUIDE_PLAYBOOKS: GuidePlaybook[] = [
  {
    id: "catalog-audit",
    title: "Catalog Audit Playbook",
    summary: "Score every SKU for completeness, attribute gaps, and conversion blockers before you publish.",
    originalPriceEur: 79,
    highlight: true,
  },
  {
    id: "email-marketing-intro",
    title: "Email Marketing Intro",
    summary: "Launch lifecycle flows that match your catalog segments — welcome, win-back, and restock.",
    originalPriceEur: 119,
    highlight: true,
  },
  {
    id: "meta-ads-starter",
    title: "Meta Ads Starter Playbook",
    summary: "Structure catalog campaigns, creative angles, and retargeting for DTC and marketplace brands.",
    originalPriceEur: 299,
    highlight: true,
  },
  {
    id: "roi-calculator",
    title: "ROI Calculator",
    summary: "Model content refresh ROI across SKU count, CVR lift, and agency vs AI cost per listing.",
    originalPriceEur: 199,
    highlight: true,
  },
  {
    id: "ai-search-visibility",
    title: "AI Search Visibility",
    summary: "Optimize for RUFUS-style discovery, FAQ blocks, and attribute-rich copy AI shoppers trust.",
    originalPriceEur: 249,
    highlight: true,
  },
  {
    id: "shopify-listing-refresh",
    title: "Shopify Listing Refresh",
    summary: "Bulk refresh titles, metafields, and collection copy while keeping theme and brand intact.",
    originalPriceEur: 149,
  },
  {
    id: "woocommerce-seo",
    title: "WooCommerce SEO Checklist",
    summary: "Category templates, schema, and long-tail pages for WordPress catalogs at scale.",
    originalPriceEur: 129,
  },
  {
    id: "prestashop-attributes",
    title: "PrestaShop Attribute Mapping",
    summary: "Normalize features, combinations, and multilingual fields for EU marketplaces.",
    originalPriceEur: 159,
  },
  {
    id: "logicommerce-geo",
    title: "LogiCommerce GEO Playbook",
    summary: "Localize Spanish and EU storefronts with region-aware copy and compliance-friendly claims.",
    originalPriceEur: 179,
  },
  {
    id: "bulk-sku-sprint",
    title: "Bulk SKU Content Sprint",
    summary: "Run a 30-day cadence to refresh high-traffic SKUs first, then long-tail catalog depth.",
    originalPriceEur: 229,
  },
];

export const ECOMMERCE_GUIDE_HIGHLIGHTS = ECOMMERCE_GUIDE_PLAYBOOKS.filter((p) => p.highlight);
export const ECOMMERCE_GUIDE_REST = ECOMMERCE_GUIDE_PLAYBOOKS.filter((p) => !p.highlight);

export const GUIDE_PACK_STORAGE_KEY = "productpixl-ecommerce-guide-unlocked";

export function formatGuidePriceEur(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ECOMMERCE_GUIDE_TOTAL_VALUE_EUR = ECOMMERCE_GUIDE_PLAYBOOKS.reduce(
  (sum, p) => sum + p.originalPriceEur,
  0
);
