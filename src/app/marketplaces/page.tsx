import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { LandingBol } from "@/components/marketing/landing-bol";
import { LandingCalculator } from "@/components/marketing/landing-calculator";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "EU & Bol.com — ProductPixl",
  description: "Marketplace-aware listing copy and gallery generation for Amazon EU and Bol.com sellers.",
};

export default async function MarketplacesPage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Marketplaces</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Amazon US, EU, and Bol.com</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">
            Pick your marketplace in the studio — copy tone, image notes, and credit estimates adjust automatically.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href={session ? STUDIO_ROUTES.images : "/login"}>
              {session ? "Open image studio" : "Sign in to start"}
            </Link>
          </Button>
        </div>
      </section>
      <LandingBol />
      <LandingCalculator />
      <section className="border-t border-[var(--border)] px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Next: read the FAQ</h2>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">Bol.com, credits, and the free grader explained.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/faq">Open FAQ →</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
