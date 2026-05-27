import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { HOME_STATS, USP_SUBHEAD, WORKFLOW_STEPS } from "@/lib/marketing-content";
import { USP_ONE_LINER, USP_PILLARS } from "@/lib/marketing-usp";

export const metadata: Metadata = {
  title: "ProductPixl — AI listing studio for Amazon sellers",
  description: USP_ONE_LINER,
};

export default async function HomePage() {
  const session = await auth();
  const primaryCta = session ? STUDIO_ROUTES.home : "/login";
  const primaryLabel = session ? "Open your studio" : "Start free — 10 credits";

  return (
    <MarketingPageShell>
      {/* ─── SECTION 1: HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 md:pt-28 md:pb-36">
        {/* Radial amber glow backdrop */}
        <div className="bg-radial-warm absolute inset-0 pointer-events-none" />
        {/* Dot grid */}
        <div className="bg-dots absolute inset-0 opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* ── Left: copy ── */}
            <div>
              {/* Eyebrow badge */}
              <div className="badge-accent mb-7 inline-flex animate-fade-up">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
                AI Listing Studio · For Amazon Sellers
              </div>

              {/* Headline */}
              <h1
                className="font-display text-5xl font-bold tracking-tight leading-[1.08] text-balance md:text-6xl lg:text-[3.5rem] animate-fade-up stagger-1"
                style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
              >
                Stop waiting 3 weeks for listing photos that cost{" "}
                <span className="text-[var(--accent)] amber-text-glow">€2,000.</span>
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-lg leading-relaxed text-[var(--muted-fg)] max-w-xl animate-fade-up stagger-2">
                {USP_SUBHEAD}
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-up stagger-3">
                <Link href={primaryCta} className="btn-primary text-center">
                  {primaryLabel}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href="/how-it-works" className="btn-ghost text-center">
                  See how it works
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>

              {/* Price anchor pill */}
              <div className="mt-5 animate-fade-up stagger-3">
                <span className="badge-accent">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                    <path d="M6 1v10M3 4h5a1 1 0 010 2H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  From €2/generation
                </span>
              </div>

              {/* Stats anchor row */}
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted-fg)] animate-fade-up stagger-4">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--accent)]">
                    <path d="M7 1.5L8.5 5.5H13L9.5 8L10.5 12L7 9.5L3.5 12L4.5 8L1 5.5H5.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  10 free credits
                </span>
                <span className="text-[var(--border)]">·</span>
                <span>No subscription</span>
                <span className="text-[var(--border)]">·</span>
                <span>Google or email sign-in</span>
              </div>
            </div>

            {/* ── Right: ShowcaseMosaic ── */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none animate-scale-in">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-soft)] via-transparent to-transparent opacity-60 blur-3xl pointer-events-none" />
              <ShowcaseMosaic priority />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: STATS BAR ───────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {HOME_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="font-display text-3xl font-bold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-fg)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: VALUE PILLARS (BENTO GRID) ───────────────────── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-14 max-w-xl">
            <p className="badge-accent mb-4 inline-flex">
              Why ProductPixl
            </p>
            <h2
              className="font-display text-4xl font-bold tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
            >
              Everything you need to launch, nothing you don&apos;t
            </h2>
          </div>

          {/* Bento grid — 3×2 */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Card 0: spans 2 cols — "Fast" card */}
            <div className="card-surface p-7 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] text-lg">3 steps, then you publish</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">
                    Upload a photo. AI researches your category and builds listing-specific prompts. Review, then generate — publish to Amazon or Bol.com directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 1: Affordable */}
            <div className="card-surface p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)] mb-5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <path d="M10 2v16M3 6h13a1 1 0 010 2H3a1 1 0 010-2zM3 14h13a1 1 0 010 2H3a1 1 0 010-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-lg">€2/generation</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] flex-1">
                  Pay per run, not per month. Idle months cost zero. Credit packs from €2.
                </p>
              </div>
            </div>

            {/* Card 2: Amazon-native */}
            <div className="card-surface p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)] mb-5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <path d="M3 10a7 7 0 1014 0A7 7 0 003 10zm7-3a1 1 0 110-2 1 1 0 010 2zm-1 3h2v5h-2v-5z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-lg">Amazon-native</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] flex-1">
                  A+ modules, listing copy, and image specs built for Amazon&apos;s requirements and RUFUS-ready structure.
                </p>
              </div>
            </div>

            {/* Card 3: European marketplaces */}
            <div className="card-surface p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)] mb-5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 10h14M10 3c-2 2-3 5-3 7s1 5 3 7M10 3c2 2 3 5 3 7s-1 5-3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-lg">EU & UK marketplaces</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] flex-1">
                  Amazon EU + UK supported. Export formats built for European seller requirements.
                </p>
              </div>
            </div>

            {/* Card 4: No subscription */}
            <div className="card-surface p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)] mb-5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <path d="M10 2L2 6l8 4 8-4-8-4zM2 10l8 4 8-4M2 14l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-lg">No subscription</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] flex-1">
                  Credits never expire. Use them when you need them. No monthly lock-in.
                </p>
              </div>
            </div>

            {/* Card 5: QA guaranteed */}
            <div className="card-surface p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent-soft)] to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[rgba(245,158,11,0.15)] mb-5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--accent)]">
                    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm3 5l-4 4-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-lg">QA guaranteed</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] flex-1">
                  Review prompts before generation. Shape, label text, and colors preserved in every image.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: HOW IT WORKS ─────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-14 max-w-xl">
            <p className="badge-accent mb-4 inline-flex">How it works</p>
            <h2
              className="font-display text-4xl font-bold tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
            >
              From one photo to a full listing in 3 steps
            </h2>
          </div>

          {/* Steps */}
          <div className="grid gap-6 md:grid-cols-3">
            {WORKFLOW_STEPS.slice(0, 3).map((step, i) => (
              <div key={step.title} className="card-surface p-8 relative">
                {/* Step number */}
                <div
                  className="font-display text-6xl font-bold leading-none text-[var(--accent)] opacity-25 mb-6"
                  style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
                >
                  {i + 1}
                </div>

                <h3 className="text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-fg)]">{step.body}</p>

                {/* Connector arrow (desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-[var(--border)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12">
            <Link href="/how-it-works" className="btn-outline inline-flex items-center gap-2">
              See the full workflow
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WAITLIST / SOCIAL PROOF ─────────────────────── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="card-surface p-10 md:p-14 text-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-radial-warm opacity-40 pointer-events-none" />

            <div className="relative">
              <p className="badge-accent mb-6 inline-flex mx-auto">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <circle cx="6" cy="6" r="6" fill="currentColor" />
                </svg>
                Early access
              </p>
              <h2
                className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
              >
                Be the first to know
              </h2>
              <p className="mt-4 text-[var(--muted-fg)]">
                Join 200+ Amazon sellers on the waitlist. Get early features, pricing access, and a head start before launch.
              </p>

              {/* Email form */}
              <form
                className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Join waitlist
                </button>
              </form>

              <p className="mt-4 text-xs text-[var(--muted-fg)]">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: PRICING TEASER + CTA ────────────────────────── */}
      <section className="border-t border-[var(--border)] px-4 py-16">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
            >
              <span className="text-[var(--accent)]">€2/generation.</span>{" "}
              <span className="text-[var(--muted-fg)]">No subscription. No commitments.</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Pay per run. Credits never expire.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/pricing" className="btn-outline">
              View pricing
            </Link>
            <Link href={primaryCta} className="btn-primary">
              Start free — 10 credits
            </Link>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
