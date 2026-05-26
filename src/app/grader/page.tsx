import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { GraderTool } from "@/components/grader/grader-tool";
import { ShowcaseSampleStrip } from "@/components/marketing/showcase-sample-strip";
import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
    <div className="mt-16 rounded-2xl bg-[var(--ink)] p-8 text-center text-white md:p-12">
      <h2 className="font-serif text-2xl">Copy is only half the listing</h2>
      <p className="mx-auto mt-3 max-w-lg text-white/70">
        ProductPixl generates gallery images + copy from one photo. No ASIN required.
      </p>
      <ShowcaseSampleStrip />
      <Button asChild size="lg" className="mt-6">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}

export default async function GraderPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const ctaHref = signedIn ? "/generate" : "/login";
  const ctaLabel = signedIn ? "Open image studio" : "Start free — 10 credits";

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
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
            Free tool
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Amazon Listing Grader</h1>
          <p className="mt-4 text-lg text-[var(--muted-fg)]">
            Pixii charges $207/mo for listing design. We give you a free A–F score on your copy —
            with RUFUS/COSMO tips to improve conversion before you spend on ads.
          </p>
        </div>
        <div className="mt-12">
          <GraderTool signedIn={false} />
        </div>
        <GraderMarketingFooter ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
      <SiteFooter />
    </div>
  );
}
