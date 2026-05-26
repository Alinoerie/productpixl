import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { EcommerceGuidePackSection } from "@/components/marketing/ecommerce-guide-pack";
import { Button } from "@/components/ui/button";
import { ECOMMERCE_GUIDE_PLATFORMS, formatGuidePriceEur, ECOMMERCE_GUIDE_TOTAL_VALUE_EUR } from "@/lib/guide-pack-content";

export const metadata: Metadata = {
  title: "Free Ecommerce Optimization Guide Pack — ProductPixl",
  description:
    "Unlock 10 free playbooks to optimize Shopify, WooCommerce, PrestaShop, and LogiCommerce catalogs with AI — catalog audit, Meta ads, SEO, and bulk SKU workflows.",
  openGraph: {
    title: "Free Ecommerce Optimization Guide Pack — ProductPixl",
    description:
      "Ten practical playbooks for catalog content, bulk SKUs, and AI search visibility — free download.",
    url: "/guides/ecommerce",
  },
};

export default function EcommerceGuidePage() {
  return (
    <MarketingPageShell>
      <section className="border-b border-[var(--border)] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {formatGuidePriceEur(ECOMMERCE_GUIDE_TOTAL_VALUE_EUR)} value · Free
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            Ecommerce guide pack for {ECOMMERCE_GUIDE_PLATFORMS.join(", ")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">
            Practical playbooks from ProductPixl — built for sellers who need catalog scale without losing brand voice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="#unlock">Unlock free guide</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/login">Start free in studio</Link>
            </Button>
          </div>
        </div>
      </section>

      <div id="unlock">
        <EcommerceGuidePackSection showFullCatalog={false} />
      </div>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-[var(--ink)] p-8 text-center text-white md:p-12">
          <h2 className="font-serif text-2xl md:text-3xl">Guides show the plan — ProductPixl runs the creative</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            One product photo → gallery images + listing copy for Amazon and EU marketplaces. 10 free credits, no card.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-xl">
            <Link href="/login">Open listing studio</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
