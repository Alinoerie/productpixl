import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LISTING_MODULES, WORKFLOW_STEPS } from "@/lib/marketing-content";
import { USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";
import { SHOWCASE_MODULE_SAMPLES } from "@/lib/showcase";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export const metadata: Metadata = {
  title: "How it works — ProductPixl",
  description: "From one product photo to gallery images and listing copy in a single guided studio flow.",
};

export default async function HowItWorksPage() {
  const session = await auth();
  const cta = session ? STUDIO_ROUTES.images : "/login";

  return (
    <MarketingPageShell>
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{USP_TAGLINE}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
            From raw photo to publication-ready — in one flow
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">{USP_SUBHEAD}</p>
          <Button asChild className="mt-8" size="lg">
            <Link href={cta}>
              {session ? "Start image studio" : "Sign in to start"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
              >
                <span className="absolute right-4 top-4 font-serif text-4xl text-[var(--muted)]/40">{i + 1}</span>
                <step.icon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} />
                <h2 className="mt-4 font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Listing modules</h2>
              <p className="mt-2 text-[var(--muted-fg)]">Each module uses your original photo as the product reference.</p>
            </div>
            <Badge variant="secondary">Credits shown before each run</Badge>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LISTING_MODULES.map((m) => {
              const sample = SHOWCASE_MODULE_SAMPLES[m.id];
              return (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]"
                >
                  <div className="relative aspect-[4/3] bg-[var(--muted)]">
                    <Image src={sample.image} alt={sample.alt} fill sizes="280px" className="object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2.5 py-1 font-serif text-sm text-white">
                      {m.id}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{m.label}</h3>
                    <p className="mt-1 text-sm text-[var(--muted-fg)]">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Next: see sample outputs</h2>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">Real gallery runs from ProductPixl.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/gallery">View gallery →</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
