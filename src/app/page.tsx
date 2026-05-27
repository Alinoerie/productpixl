import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { EXPLORE_LINKS, HOME_STATS, USP_SUBHEAD, USP_TAGLINE, WORKFLOW_STEPS } from "@/lib/marketing-content";
import { USP_ONE_LINER } from "@/lib/marketing-usp";
import { UspPillarsSection } from "@/components/marketing/usp-sections";
import { LandingTestimonials } from "@/components/marketing/landing-testimonials";

export const metadata: Metadata = {
  title: "ProductPixl — AI listing studio for Amazon sellers",
  description: USP_ONE_LINER,
};

export default async function HomePage() {
  const session = await auth();
  const primaryCta = session ? STUDIO_ROUTES.home : "/login";
  const primaryLabel = session ? "Open your studio" : "Get started free";

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 md:pb-20 md:pt-24">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="text-center lg:text-left">
              <Badge variant="outline" className="mb-6 border-[var(--border-strong)] bg-[var(--card)] px-3 py-1">
                {USP_TAGLINE}
              </Badge>
              <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-balance md:text-6xl">
                Stop waiting 3 weeks
                <br />
                <span className="text-[var(--accent)]">for listing photos that cost €2,000.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-fg)] lg:mx-0">
                {USP_SUBHEAD}
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="w-full rounded-xl px-8 sm:w-auto">
                  <Link href={primaryCta}>
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full rounded-xl sm:w-auto">
                  <Link href="/grader">Try free listing grader</Link>
                </Button>
              </div>
              <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--muted-fg)] lg:justify-start">
                <span>10 free credits</span>
                <span className="text-[var(--border)]">·</span>
                <span>Google or email sign-in</span>
                <span className="text-[var(--border)]">·</span>
                <span>No subscription</span>
                <span className="text-[var(--border)]">·</span>
                <span className="text-[var(--accent)]">Product fidelity guaranteed</span>
              </p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--accent-soft)] to-[var(--teal-soft)] opacity-70 blur-2xl" />
                <ShowcaseMosaic priority className="relative rotate-1 lg:rotate-2" />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {HOME_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4 text-center shadow-[var(--shadow-sm)]"
              >
                <p className="font-serif text-2xl text-[var(--ink)]">{s.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <UspPillarsSection />

      <section className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Your path</p>
            <h2 className="mt-3 font-serif text-3xl">Three steps, then you publish</h2>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {WORKFLOW_STEPS.slice(0, 3).map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
              >
                <span className="font-serif text-3xl text-[var(--muted)]">{i + 1}</span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-fg)]">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/how-it-works">
                See the full workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl">Explore ProductPixl</h2>
          <p className="mt-2 max-w-xl text-[var(--muted-fg)]">
            Details live on their own pages — no endless scroll on the home page.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <p className="font-semibold group-hover:text-[var(--accent)]">{link.title}</p>
                <p className="mt-2 text-sm text-[var(--muted-fg)]">{link.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LandingTestimonials />

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[var(--shadow-lg)] md:p-12">
          <h2 className="font-serif text-3xl">Ready to build your first listing?</h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--muted-fg)]">
            Sign in with Google or email magic link. New accounts get 10 free credits instantly.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-xl px-10">
            <Link href={primaryCta}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
