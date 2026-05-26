import { Camera, Layers, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { USP_STATS, USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";

export { USP_TAGLINE, USP_SUBHEAD };

export const HOME_STATS = USP_STATS;

export const WORKFLOW_STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Camera,
    title: "Upload one photo",
    body: "No ASIN required. Works for new launches, private label, and Bol.com — not just existing Amazon listings.",
  },
  {
    icon: Sparkles,
    title: "AI analyzes & researches",
    body: "Vision reads your label and materials. Category research runs before anything is generated.",
  },
  {
    icon: Layers,
    title: "Gallery + copy generated",
    body: "Hero, lifestyle, and detail images — plus listing copy — built with listing-specific prompts.",
  },
  {
    icon: Zap,
    title: "Download & publish",
    body: "Export gallery ZIP and marketplace copy. Credits required are shown before each run.",
  },
];

export const LISTING_MODULES = [
  { id: "L1", label: "Main hero", desc: "White-background hero, Amazon-compliant 1:1" },
  { id: "L3", label: "Lifestyle", desc: "In-context scene that sells the use case" },
  { id: "L4", label: "Detail", desc: "Texture, materials, and label fidelity" },
  { id: "L8", label: "Packaging", desc: "Optional unboxing / pack shot module" },
] as const;

export const EXPLORE_LINKS = [
  { href: "/how-it-works", title: "How it works", desc: "Four-step studio flow and listing modules" },
  { href: "/guides/ecommerce", title: "Free guide pack", desc: "10 ecommerce playbooks for Shopify, WooCommerce & more" },
  { href: "/gallery", title: "Sample gallery", desc: "Real outputs from ProductPixl runs" },
  { href: "/marketplaces", title: "EU & Bol.com", desc: "Marketplace positioning and calculator" },
  { href: "/compare", title: "Why ProductPixl", desc: "Launch before you list vs catalog-sync & ASIN tools" },
  { href: "/pricing", title: "Pricing", desc: "Pay per generation — credit packs" },
  { href: "/faq", title: "FAQ", desc: "Credits, ASINs, Bol.com, and the grader" },
  { href: "/grader", title: "Free grader", desc: "Score your listing before you spend credits" },
] as const;
