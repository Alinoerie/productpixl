import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { DemoBookingWizard } from "@/components/marketing/demo-booking-wizard";
import { DEMO_DURATION_MINUTES } from "@/lib/demo-booking-content";

export const metadata: Metadata = {
  title: "Book a Demo — ProductPixl",
  description:
    "Book a 30-minute ProductPixl demo. See how AI turns your ecommerce catalog into listing images and copy that improve visibility and conversion.",
  openGraph: {
    title: "Book a ProductPixl Demo",
    description: "AI-ready product content for Shopify, Amazon, Bol.com, and large catalogs.",
    url: "/demo",
  },
};

export default function DemoBookingPage() {
  return (
    <MarketingPageShell className="bg-[var(--muted)]/20">
      <MarketingHero
        align="center"
        eyebrow={`${DEMO_DURATION_MINUTES}-minute walkthrough`}
        title="See ProductPixl on your catalog"
        description="For teams scaling Shopify, WooCommerce, Amazon, or EU marketplaces — gallery generation, listing copy, and export workflows live."
        className="pb-8"
      />
      <section className="px-4 pb-16 md:pb-24">
        <div data-m-scroll className="mx-auto max-w-xl">
          <DemoBookingWizard />
        </div>
      </section>
    </MarketingPageShell>
  );
}
