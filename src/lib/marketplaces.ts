export type MarketplaceId =
  | "AMAZON_US"
  | "AMAZON_UK"
  | "AMAZON_DE"
  | "BOL_NL"
  | "SHOPIFY";

export interface MarketplaceConfig {
  id: MarketplaceId;
  label: string;
  region: string;
  flag: string;
  copyNote: string;
  imageNote: string;
  rufusOptimized: boolean;
}

export const MARKETPLACES: MarketplaceConfig[] = [
  {
    id: "AMAZON_US",
    label: "Amazon US",
    region: "North America",
    flag: "🇺🇸",
    copyNote: "Title ≤200 chars · 5 bullets · RUFUS-friendly benefit-led bullets",
    imageNote: "Pure white L1 hero · 1:1 · min 1000px",
    rufusOptimized: true,
  },
  {
    id: "AMAZON_UK",
    label: "Amazon UK",
    region: "Europe",
    flag: "🇬🇧",
    copyNote: "UK English spelling · metric units where relevant",
    imageNote: "Same gallery standards as US",
    rufusOptimized: true,
  },
  {
    id: "AMAZON_DE",
    label: "Amazon DE",
    region: "Europe",
    flag: "🇩🇪",
    copyNote: "German copy generation (English UI) · EU compliance tone",
    imageNote: "Lifestyle contexts suited to DACH buyers",
    rufusOptimized: true,
  },
  {
    id: "BOL_NL",
    label: "Bol.com",
    region: "Benelux",
    flag: "🇳🇱",
    copyNote:
      "Dutch marketplace tone — direct, trustworthy, less hype than US Amazon. Pixii ignores this segment.",
    imageNote: "Clean gallery · Bol prefers clear product truth over heavy infographic style",
    rufusOptimized: false,
  },
  {
    id: "SHOPIFY",
    label: "Shopify / DTC",
    region: "Global",
    flag: "🛍️",
    copyNote: "Brand voice flexible · longer description allowed",
    imageNote: "Lifestyle-forward · less strict white-background rules",
    rufusOptimized: false,
  },
];

export function getMarketplace(id: string): MarketplaceConfig {
  return MARKETPLACES.find((m) => m.id === id) ?? MARKETPLACES[0];
}
