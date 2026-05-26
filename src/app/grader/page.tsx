import Link from "next/link";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { GraderTool } from "@/components/grader/grader-tool";
import { ShowcaseSampleStrip } from "@/components/marketing/showcase-sample-strip";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Free Amazon Listing Grader — ProductPixl",
  description: "Score your listing A–F. RUFUS-ready tips. No login required.",
};

export default async function GraderPage() {
  const session = await auth();
  const ctaHref = session ? "/generate" : "/login";
  const ctaLabel = session ? "Open image studio" : "Start free — 10 credits";

  return (
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
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
          <GraderTool signedIn={!!session} />
        </div>
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
      </div>
    </div>
  );
}
