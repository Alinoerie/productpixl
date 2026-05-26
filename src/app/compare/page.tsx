import type { Metadata } from "next";
import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { LandingCompare } from "@/components/marketing/landing-compare";
import { UspContrastSection, UspLeverageSection } from "@/components/marketing/usp-sections";
import { Button } from "@/components/ui/button";
import { USP_ONE_LINER, USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";

export const metadata: Metadata = {
  title: "Why ProductPixl — compare listing tools",
  description: USP_ONE_LINER,
};

export default async function ComparePage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{USP_TAGLINE}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
            Launch before you list — then compare the alternatives
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">{USP_SUBHEAD}</p>
          <Button asChild size="lg" className="mt-8">
            <Link href={session ? STUDIO_ROUTES.images : "/login"}>
              {session ? "Start generating" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      <LandingCompare />
      <UspContrastSection />
      <UspLeverageSection />
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Compare credit packs</h2>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">Only pay when you generate.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/pricing">View pricing →</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
