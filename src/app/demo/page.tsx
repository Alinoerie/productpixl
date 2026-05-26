import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
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
      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {DEMO_DURATION_MINUTES}-minute walkthrough
          </p>
          <p className="mx-auto mt-4 max-w-lg text-[var(--muted-fg)]">
            For teams scaling Shopify, WooCommerce, Amazon, or EU marketplaces — see gallery generation, listing copy,
            and export workflows live.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <DemoBookingWizard />
        </div>
      </section>
    </MarketingPageShell>
  );
}
