import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ — ProductPixl",
  description: "Credits, ASINs, Bol.com, listing grader, and how ProductPixl compares to subscription tools.",
};

export default async function FaqPage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <section className="px-4 pt-16 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">FAQ</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Common questions</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">
            Still unsure? Try the free grader first — no credits required.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/grader">Open free grader</Link>
          </Button>
        </div>
      </section>
      <LandingFaq />
      <section className="px-4 pb-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 border-t border-[var(--border)] pt-12">
          <div>
            <h2 className="font-serif text-2xl">Next: see pricing</h2>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">Pay per generation — 10 free credits on signup.</p>
          </div>
          <Button asChild>
            <Link href={session ? "/pricing" : "/login"}>{session ? "View credits" : "Sign in"}</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
