"use client";

import { useState } from "react";

type Category = "all" | "amazon" | "aplus" | "lifestyle";

interface GalleryItem {
  id: string;
  seed: string;
  category: Exclude<Category, "all">;
  aspectRatio: "landscape" | "portrait" | "square";
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: "1", seed: "product-beauty-1", category: "amazon", aspectRatio: "landscape" },
  { id: "2", seed: "product-home-1", category: "aplus", aspectRatio: "portrait" },
  { id: "3", seed: "product-outdoor-1", category: "lifestyle", aspectRatio: "square" },
  { id: "4", seed: "product-beauty-2", category: "amazon", aspectRatio: "landscape" },
  { id: "5", seed: "product-kitchen-1", category: "aplus", aspectRatio: "landscape" },
  { id: "6", seed: "product-tech-1", category: "lifestyle", aspectRatio: "portrait" },
  { id: "7", seed: "product-fashion-1", category: "amazon", aspectRatio: "square" },
  { id: "8", seed: "product-home-2", category: "aplus", aspectRatio: "landscape" },
  { id: "9", seed: "product-beauty-3", category: "lifestyle", aspectRatio: "portrait" },
];

const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  amazon: "Amazon Listing",
  aplus: "A+ Content",
  lifestyle: "Lifestyle Shot",
};

function AspectRatioBox({ ratio }: { ratio: GalleryItem["aspectRatio"] }) {
  const paddingBottom =
    ratio === "landscape" ? "56.25%" : ratio === "portrait" ? "125%" : "100%";
  return <div style={{ paddingBottom }} className="relative w-full" />;
}

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const delay = (index % 3) * 100;
  const categoryLabel = CATEGORY_LABELS[item.category];

  return (
    <div
      className="card-surface overflow-hidden group animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="relative">
        <AspectRatioBox ratio={item.aspectRatio} />
        <div className="absolute inset-0">
          <img
            src={`https://picsum.photos/seed/${item.seed}/800/600`}
            alt={`Sample output: ${categoryLabel}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {/* Category label badge */}
        <div className="absolute bottom-3 left-3">
          <span className="badge-accent text-[10px]">{categoryLabel}</span>
        </div>
        {/* Disclaimer */}
        <div className="absolute bottom-3 right-3">
          <span className="text-[10px] text-white/40">Sample output</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
        active ? "text-[var(--foreground)]" : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full"
          style={{ animation: "fade-in 200ms ease-out" }}
        />
      )}
    </button>
  );
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredItems =
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Warm radial glow */}
        <div className="absolute inset-0 bg-radial-warm pointer-events-none" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* DEMO OUTPUTS pill */}
          <div className="mb-6 animate-fade-up" style={{ animationDelay: "0ms" }}>
            <span className="badge-accent">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="currentColor"
                className="opacity-60"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
              Demo outputs
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-display text-5xl md:text-7xl font-bold text-[var(--foreground)] mb-5 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            Gallery
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-[var(--muted-fg)] max-w-2xl mx-auto mb-4 animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            See what ProductPixl generates — sample outputs across Amazon Listings, A+ Content, and Lifestyle Shots.
          </p>

          {/* Disclaimer note */}
          <p
            className="text-sm text-[var(--muted-fg)] opacity-60 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            These are demo generations — real seller outputs coming soon
          </p>
        </div>
      </section>

      {/* ─── Category Tabs ─────────────────────────────────── */}
      <section className="px-4 mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex border-b border-[var(--border)] overflow-x-auto scrollbar-hide">
            <TabButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            >
              All
            </TabButton>
            <TabButton
              active={activeCategory === "amazon"}
              onClick={() => setActiveCategory("amazon")}
            >
              Amazon Listings
            </TabButton>
            <TabButton
              active={activeCategory === "aplus"}
              onClick={() => setActiveCategory("aplus")}
            >
              A+ Content
            </TabButton>
            <TabButton
              active={activeCategory === "lifestyle"}
              onClick={() => setActiveCategory("lifestyle")}
            >
              Lifestyle Shots
            </TabButton>
          </div>
        </div>
      </section>

      {/* ─── Gallery Grid ──────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Bento-style grid with varying sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
            {filteredItems.map((item, index) => {
              // Make first item span 2 columns on large screens (featured)
              const isFeatured = index === 0 && activeCategory === "all";
              return (
                <div
                  key={item.id}
                  className={`${isFeatured ? "lg:col-span-2 lg:row-span-1" : ""}`}
                >
                  <GalleryCard item={item} index={index} />
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-20 text-[var(--muted-fg)]">
              <p>No items in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Waitlist CTA ──────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="card-surface p-10 md:p-14 text-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[var(--accent)] opacity-5 blur-3xl pointer-events-none" />

            <div className="relative">
              <span className="badge-accent mb-6 inline-flex">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="currentColor"
                  className="opacity-60"
                >
                  <circle cx="4" cy="4" r="4" />
                </svg>
                Early access
              </span>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">
                Want to see your products here?
              </h2>

              <p className="text-[var(--muted-fg)] mb-8 max-w-md mx-auto">
                Join the waitlist and be first to generate real outputs with ProductPixl.
              </p>

              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="you@seller.com"
                  required
                  className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Reserve my free credits
                </button>
              </form>

              <p className="text-xs text-[var(--muted-fg)] opacity-60 mt-4">
                No credit card required. Free credits on launch.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
