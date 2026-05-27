/** Single source of truth for pricing page — packs, signup tier, and monthly previews (EUR). */

export const PRICING_CURRENCY = "EUR" as const;
export const PRICING_VAT_NOTE = "All prices exclude VAT.";

export const CREDIT_TOP_UP_PACKS = [
  {
    key: "starter" as const,
    name: "Starter",
    credits: 10,
    price: "€29",
    priceCents: 2900,
    perCredit: "€2.90",
    tag: null as string | null,
  },
  {
    key: "growth" as const,
    /** Stripe key stays `growth`; display name avoids clash with monthly Growth plan. */
    name: "Catalog",
    credits: 30,
    price: "€79",
    priceCents: 7900,
    perCredit: "€2.63",
    tag: "Best value",
  },
];

export type PricingPlanColumnId = "free" | "starter" | "catalog" | "growth" | "scale" | "enterprise";

export type PricingPlanColumn = {
  id: PricingPlanColumnId;
  name: string;
  tagline: string;
  price: string;
  priceSuffix?: string;
  creditsLabel: string;
  popular?: boolean;
  comingSoon?: boolean;
  highlights: string[];
  stripePackKey?: "starter" | "growth";
  ctaLabel: string;
  ctaHref?: string;
  ctaMailto?: string;
};

export const PRICING_PLAN_COLUMNS: PricingPlanColumn[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Test the studio risk-free — no card required.",
    price: "€0",
    creditsLabel: "10 credits on signup",
    highlights: [
      "Image studio + copy studio",
      "Free listing grader",
      "Brand profile onboarding",
      "Marketplace export when a run completes",
    ],
    ctaLabel: "Start free",
    ctaHref: "/login?callbackUrl=/pricing",
  },
  {
    id: "starter",
    name: "Starter pack",
    tagline: "One-time top-up for your next listing push.",
    price: "€29",
    creditsLabel: "10 credits included",
    highlights: [
      "Pay only when you generate",
      "Quote shown before every run",
      "Amazon, Bol.com & Shopify exports",
      "Balance never expires",
    ],
    stripePackKey: "starter",
    ctaLabel: "Buy Starter pack",
  },
  {
    id: "catalog",
    name: "Catalog pack",
    tagline: "Best per-credit value for multiple SKUs.",
    price: "€79",
    creditsLabel: "30 credits included",
    popular: true,
    highlights: [
      "Lowest cost per credit today",
      "Full gallery + copy workflows",
      "Export packs (ZIP + listing files)",
      "Ideal for 3–10 SKU refreshes*",
    ],
    stripePackKey: "growth",
    ctaLabel: "Buy Catalog pack",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Monthly allowance for teams scaling catalog output.",
    price: "€125",
    priceSuffix: "/ mo",
    creditsLabel: "4,400 credits / month",
    comingSoon: true,
    highlights: [
      "Image + copy studio included",
      "3 brands · multi-marketplace",
      "Batch listing builder + clone catalog",
      "Playbooks with credits today",
      "Priority email support",
    ],
    ctaLabel: "Coming soon",
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "Agencies and large catalogs with richer workflows.",
    price: "€375",
    priceSuffix: "/ mo",
    creditsLabel: "17,600 credits / month",
    comingSoon: true,
    highlights: [
      "Everything in Growth",
      "20 brands · batch tools",
      "Clone & listing builder live with credits",
      "A+ studio + video beta",
      "Priority support",
    ],
    ctaLabel: "Coming soon",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom volume, integrations, and onboarding.",
    price: "Custom",
    creditsLabel: "Custom credit allowance",
    comingSoon: true,
    highlights: [
      "API & custom integrations",
      "Unlimited brands",
      "Sales-assisted setup",
      "Dedicated success contact",
    ],
    ctaLabel: "Book a demo",
    ctaHref: "/demo",
  },
];

export type ComparisonRow = {
  label: string;
  group: string;
  values: Record<PricingPlanColumnId, string>;
  footnote?: string;
};

export const PRICING_COMPARISON_GROUPS = [
  "Credits & catalog",
  "Studio",
  "Export & brand",
  "Scale features",
  "Support",
] as const;

export const PRICING_COMPARISON_ROWS: ComparisonRow[] = [
  {
    group: "Credits & catalog",
    label: "Credits included",
    values: {
      free: "10 (signup)",
      starter: "10",
      catalog: "30",
      growth: "4,400 / mo",
      scale: "17,600 / mo",
      enterprise: "Custom",
    },
  },
  {
    group: "Credits & catalog",
    label: "Typical listing runs*",
    values: {
      free: "Explore studio",
      starter: "~1 copy or partial gallery",
      catalog: "~1 full gallery or 2+ copy runs",
      growth: "~140 image runs / mo*",
      scale: "~560 image runs / mo*",
      enterprise: "Custom",
    },
    footnote: "Indicative — depends on modules, marketplace, and intake depth.",
  },
  {
    group: "Credits & catalog",
    label: "Extra credits",
    values: {
      free: "Buy packs anytime",
      starter: "Buy packs anytime",
      catalog: "Buy packs anytime",
      growth: "Top-up packs add to balance",
      scale: "Top-up packs add to balance",
      enterprise: "Custom",
    },
  },
  {
    group: "Studio",
    label: "Image studio (L1/L3/L4/L8)",
    values: {
      free: "Yes",
      starter: "Yes",
      catalog: "Yes",
      growth: "Yes",
      scale: "Yes",
      enterprise: "Yes",
    },
  },
  {
    group: "Studio",
    label: "Copy studio + grader",
    values: {
      free: "Yes",
      starter: "Yes",
      catalog: "Yes",
      growth: "Yes",
      scale: "Yes",
      enterprise: "Yes",
    },
  },
  {
    group: "Studio",
    label: "Prompt review before generate",
    values: {
      free: "Yes",
      starter: "Yes",
      catalog: "Yes",
      growth: "Yes",
      scale: "Yes",
      enterprise: "Yes",
    },
  },
  {
    group: "Export & brand",
    label: "Marketplace export packs",
    values: {
      free: "When run completes",
      starter: "When run completes",
      catalog: "When run completes",
      growth: "Included",
      scale: "Included",
      enterprise: "Included",
    },
  },
  {
    group: "Export & brand",
    label: "Brand kits",
    values: {
      free: "1 brand",
      starter: "1 brand",
      catalog: "1 brand",
      growth: "Up to 3",
      scale: "Up to 20",
      enterprise: "Unlimited",
    },
  },
  {
    group: "Scale features",
    label: "Batch playbooks & clone",
    values: {
      free: "With credits",
      starter: "With credits",
      catalog: "With credits",
      growth: "With credits",
      scale: "With credits",
      enterprise: "Custom",
    },
  },
  {
    group: "Scale features",
    label: "Billing model",
    values: {
      free: "Free signup",
      starter: "One-time pack",
      catalog: "One-time pack",
      growth: "Monthly subscription",
      scale: "Monthly subscription",
      enterprise: "Custom contract",
    },
  },
  {
    group: "Support",
    label: "Support",
    values: {
      free: "Help center + email",
      starter: "Help center + email",
      catalog: "Help center + email",
      growth: "Priority email",
      scale: "Priority email",
      enterprise: "Dedicated",
    },
  },
];

export const PRICING_FAQ = [
  {
    q: "How do credits work?",
    a: "Credits are ProductPixl's only currency. Each image or copy run shows the exact total before you confirm. You only spend credits when you generate — not when you browse, edit prompts, or export finished work.",
  },
  {
    q: "What's the difference between packs and monthly plans?",
    a: "Credit packs are one-time top-ups in EUR — buy when you ship new SKUs. Monthly plans (Growth and Scale) will include a recurring credit allowance plus higher brand limits. Packs are live today; subscriptions are coming soon.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. Every account starts with 10 free credits — no credit card. Use them in image studio, copy studio, or alongside the free listing grader.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "Studio runs pause until you top up. Buy a Starter or Catalog pack from this page, or sign in to see pack recommendations based on your catalog estimate.",
  },
  {
    q: "Do credits expire?",
    a: "Signup credits and paid pack credits stay on your balance until you use them. Monthly plan allowances will reset each billing cycle when subscriptions launch.",
  },
  {
    q: "Can I change plans later?",
    a: "You can buy additional packs anytime. When monthly plans launch, you'll be able to upgrade or downgrade from your account settings.",
  },
  {
    q: "Who owns the content generated?",
    a: "You do. ProductPixl generates listing images and copy for your products — use them on Amazon, Bol.com, Shopify, and other channels you sell on.",
  },
  {
    q: "Have questions about Enterprise?",
    a: "Book a 30-minute demo and we'll walk through catalog size, marketplaces, and custom needs.",
  },
] as const;

export function formatCreditBalance(credits: number): string {
  return credits.toLocaleString();
}

export function creditBalanceSubtext(credits: number): string {
  if (credits < 2) return "Top up before your next run";
  return "Each studio run shows credits required before you generate";
}

export function showCalculatorBalance(credits: number): boolean {
  return credits < 5000;
}

export function packAddsLine(creditsInPack: number, currentBalance: number): string {
  if (currentBalance >= 5000) {
    return `Adds ${creditsInPack} credits to your balance`;
  }
  return `Adds ${creditsInPack} credits · ${formatCreditBalance(currentBalance + creditsInPack)} total after purchase`;
}

export function recommendTopUpPack(balance: number, creditsNeeded: number): "starter" | "growth" | null {
  if (balance >= 5000) return null;
  const deficit = Math.max(0, creditsNeeded - balance);
  if (deficit === 0 && balance >= 5) return null;
  if (deficit <= 10 || balance < 5) return "starter";
  return "growth";
}
