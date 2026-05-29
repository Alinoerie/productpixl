import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { PublicMarketingFrame } from "@/components/marketing/public-marketing-frame";
import { GraderTool } from "@/components/grader/grader-tool";
import { ShowcaseSampleStrip } from "@/components/marketing/showcase-sample-strip";
import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { MarketingSection } from "@/components/marketing/motion/marketing-section";

export const metadata: Metadata = {
  title: "Free Amazon Listing Grader — ProductPixl",
  description: "Score your listing A–F. RUFUS-ready tips. No login required.",
  openGraph: {
    title: "Free Amazon Listing Grader — ProductPixl",
    description: "Score your listing A–F. RUFUS-ready tips. No login required.",
    url: "/grader",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Amazon Listing Grader — ProductPixl",
    description: "Score your listing A–F. RUFUS-ready tips. No login required.",
  },
};

function GraderMarketingFooter({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <MarketingSection className="px-4 pb-16 pt-4">
      <div
        data-m-scroll
        className="mx-auto max-w-6xl rounded-2xl bg-[var(--ink)] p-8 text-center text-white md:p-12"
      >
        <h2 className="font-serif text-2xl">Copy is only half the listing</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/70">
          ProductPixl generates gallery images + copy from one photo. No ASIN required.
        </p>
        <ShowcaseSampleStrip />
        <div className="m-action mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/guides/ecommerce">Free guide pack →</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/demo">Book a demo →</Link>
          </Button>
        </div>
      </div>
    </MarketingSection>
  );
}

export default async function GraderPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const ctaHref = signedIn ? STUDIO_ROUTES.images : "/login";
  const ctaLabel = signedIn ? "Open images" : "Start free — 10 credits";

  if (signedIn) {
    return (
      <StudioProviders>
        <AppShell>
          <div className="space-y-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
            <PageHeader
              eyebrow="Free tool"
              title="Amazon Listing Grader"
              description="Score your copy A–F with RUFUS/COSMO tips — paste from any project or write fresh."
            />
            <GraderTool signedIn />
          </div>
        </AppShell>
      </StudioProviders>
    );
  }

  return (
    <PublicMarketingFrame>
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <MarketingHero
          eyebrow="Free tool"
          title="Amazon Listing Grader"
          description="Pixii charges $207/mo for listing design. We give you a free A–F score on your copy — with RUFUS/COSMO tips to improve conversion before you spend on ads."
          align="left"
        />

        <MarketingSection scroll={false} className="mt-12">
          <div data-m-scroll>
            <GraderTool signedIn={false} />
          </div>
        </MarketingSection>

        <GraderMarketingFooter ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </div>
    </PublicMarketingFrame>
  );
}
