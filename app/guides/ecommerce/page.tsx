import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { MarketingInkBand } from "@/components/marketing/motion/marketing-section";
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
      <MarketingHero
        align="center"
        eyebrow={`${formatGuidePriceEur(ECOMMERCE_GUIDE_TOTAL_VALUE_EUR)} value · Free`}
        title={`Ecommerce guide pack for ${ECOMMERCE_GUIDE_PLATFORMS.join(", ")}`}
        description="Practical playbooks from ProductPixl — built for sellers who need catalog scale without losing brand voice."
        actions={
          <>
            <Button asChild size="lg" className="m-action rounded-xl">
              <Link href="#unlock">Unlock free guide</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="m-action rounded-xl">
              <Link href="/login">Start free in studio</Link>
            </Button>
          </>
        }
        className="border-b border-[var(--border)]"
      />

      <div id="unlock">
        <EcommerceGuidePackSection showFullCatalog={false} />
      </div>

      <MarketingInkBand
        title="Guides show the plan — ProductPixl runs the creative"
        description="One product photo → gallery images + listing copy for Amazon and EU marketplaces. 10 free credits, no card."
        actions={
          <Button asChild size="lg" className="m-action rounded-xl">
            <Link href="/login">Open listing studio</Link>
          </Button>
        }
      />
    </MarketingPageShell>
  );
}
