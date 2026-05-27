"use client";

import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = "yes" | "no" | "partial";

const FEATURES: { label: string; note?: string }[] = [
  { label: "No ASIN or live listing required" },
  { label: "Gallery images — 12 listing modules" },
  { label: "A+ content — 15 layout modules" },
  { label: "Amazon-specific copy (title, bullets, description)" },
  { label: "Video generation from product photo" },
  { label: "Batch & variation runs" },
  { label: "EU & Bol.com marketplace native" },
  { label: "Product fidelity — shape & colors preserved", note: "We never warp or replace your product" },
  { label: "Background lock across gallery modules", note: "Keep a consistent background across all generated images" },
  { label: "Pay per run — no monthly subscription" },
];

const TOOLS: {
  name: string;
  highlight?: boolean;
  price: string;
  priceNote: string;
  tiers: Tier[];
}[] = [
  {
    name: "ProductPixl",
    highlight: true,
    price: "€0 to start",
    priceNote: "10 free credits · pay per run",
    tiers: ["yes", "yes", "yes", "yes", "yes", "yes", "yes", "yes", "yes", "yes"],
  },
  {
    name: "WizStudio",
    price: "$250–1,125/mo",
    priceNote: "Per-download model · enterprise SKUs",
    tiers: ["yes", "yes", "no", "no", "no", "yes", "no", "yes", "no", "no"],
  },
  {
    name: "Pixii",
    price: "$200+/mo",
    priceNote: "Subscription · requires live ASIN",
    tiers: ["no", "yes", "no", "yes", "no", "no", "no", "partial", "no", "no"],
  },
  {
    name: "Pebblely",
    price: "From $29/mo",
    priceNote: "Subscription · 70 images/mo on Starter",
    tiers: ["yes", "yes", "no", "no", "yes", "no", "no", "no", "no", "no"],
  },
  {
    name: "Botika",
    price: "From $23/mo",
    priceNote: "Subscription · AI model training",
    tiers: ["yes", "yes", "no", "no", "yes", "no", "no", "no", "no", "no"],
  },
  {
    name: "ChatGPT / generic AI",
    price: "Free / $20+/mo",
    priceNote: "No marketplace modules or image pipeline",
    tiers: ["yes", "no", "no", "partial", "no", "no", "no", "no", "yes", "no"],
  },
];

function TierIcon({ tier }: { tier: Tier }) {
  if (tier === "yes")
    return <Check className="mx-auto h-4 w-4 text-[var(--accent)]" strokeWidth={2.5} />;
  if (tier === "partial")
    return <Minus className="mx-auto h-4 w-4 text-[var(--warning)]" strokeWidth={2.5} />;
  return <X className="mx-auto h-4 w-4 text-[var(--muted-fg)]/50" strokeWidth={2} />;
}

export function LandingCompare() {
  return (
    <section data-m-scroll className="border-y border-[var(--border)] bg-[var(--ink)] px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            How we compare
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            ProductPixl vs WizStudio, Pixii, and generic AI
          </h2>
          <p className="mt-4 text-white/70">
            Most tools do one thing — images or copy or catalog sync. ProductPixl does all three from a single product photo, before the listing even exists.
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-[40%] py-3 pr-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                  Feature
                </th>
                {TOOLS.map((tool) => (
                  <th
                    key={tool.name}
                    className={cn(
                      "px-3 py-3 text-center",
                      tool.highlight && "rounded-t-xl bg-[var(--accent)]/15"
                    )}
                  >
                    <p
                      className={cn(
                        "font-semibold",
                        tool.highlight ? "text-[var(--accent)]" : "text-white/80"
                      )}
                    >
                      {tool.name}
                    </p>
                    <p className="mt-0.5 text-xs font-normal text-white/40">{tool.price}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, fi) => (
                <tr
                  key={feat.label}
                  className={cn(
                    "border-t border-white/10",
                    fi % 2 === 0 ? "bg-white/[0.02]" : ""
                  )}
                >
                  <td className="py-3 pr-4">
                    <p className="text-white/80">{feat.label}</p>
                    {feat.note ? (
                      <p className="mt-0.5 text-xs text-white/40">{feat.note}</p>
                    ) : null}
                  </td>
                  {TOOLS.map((tool) => (
                    <td
                      key={tool.name}
                      className={cn(
                        "px-3 py-3 text-center",
                        tool.highlight && "bg-[var(--accent)]/10"
                      )}
                    >
                      <TierIcon tier={tool.tiers[fi] ?? "no"} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/10">
                <td className="py-4 pr-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                  Starting cost
                </td>
                {TOOLS.map((tool) => (
                  <td
                    key={tool.name}
                    className={cn(
                      "px-3 py-4 text-center",
                      tool.highlight && "rounded-b-xl bg-[var(--accent)]/10"
                    )}
                  >
                    <p
                      className={cn(
                        "font-semibold",
                        tool.highlight ? "text-[var(--accent)]" : "text-white/70"
                      )}
                    >
                      {tool.price}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">{tool.priceNote}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-white/30">
          Competitor data based on publicly available pricing and feature pages as of 2026. ⚠ = partial support. ProductPixl data reflects live product.
        </p>
      </div>
    </section>
  );
}
