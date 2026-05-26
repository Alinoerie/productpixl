import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  USP_LEVERAGE_PLAYS,
  USP_PILLARS,
  USP_PROOF_CHIPS,
  USP_TAGLINE,
  USP_VS_MARKET,
} from "@/lib/marketing-usp";
import { cn } from "@/lib/utils";

export function UspProofChips({ className = "" }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {USP_PROOF_CHIPS.map((chip) => (
        <li
          key={chip}
          className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted-fg)]"
        >
          {chip}
        </li>
      ))}
    </ul>
  );
}

export function UspPillarsSection({ showLeverage = false }: { showLeverage?: boolean }) {
  return (
    <section aria-labelledby="usp-pillars-heading" className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{USP_TAGLINE}</p>
        <h2 id="usp-pillars-heading" className="mt-3 max-w-3xl font-serif text-3xl md:text-4xl">
          What only ProductPixl combines
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--muted-fg)]">
          Catalog-sync tools optimize SKUs you already have. ASIN suites need a live listing. Generic AI skips
          research and images. We built for the gap: <strong className="font-medium text-[var(--foreground)]">launch creative before you publish.</strong>
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {USP_PILLARS.map((pillar, index) => (
            <article
              key={pillar.id}
              className={cn(
                "rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5",
                index === 0 && "md:col-span-2 lg:col-span-1 lg:row-span-1 border-[var(--accent)]/30 bg-[var(--accent-soft)]/20"
              )}
            >
              <h3 className="font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{pillar.body}</p>
              {showLeverage ? (
                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-fg)]">
                  <span className="font-semibold text-[var(--foreground)]">Leverage: </span>
                  {pillar.leverage}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UspContrastSection() {
  return (
    <section aria-labelledby="usp-contrast-heading" className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="usp-contrast-heading" className="font-serif text-3xl md:text-4xl">
          Where we win in the market
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-fg)]">
          Honest contrast — we&apos;re not the best bulk CMS sync for 10,000 SKUs today. We&apos;re the fastest path
          from one photo to a publish-ready listing.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {[USP_VS_MARKET.catalogSyncTools, USP_VS_MARKET.asinTools, USP_VS_MARKET.genericAi].map((col) => (
            <div key={col.label} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
              <p className="text-sm font-medium text-[var(--muted-fg)]">{col.label}</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-fg)]">
                {col.weaknesses.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span className="text-[var(--muted-fg)]/60">—</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)]/25 p-5 lg:col-span-2">
            <p className="text-sm font-medium text-[var(--accent)]">{USP_VS_MARKET.productPixl.label}</p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {USP_VS_MARKET.productPixl.strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2.5} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UspLeverageSection() {
  return (
    <section aria-labelledby="usp-leverage-heading" className="border-t border-[var(--border)] bg-[var(--ink)] px-4 py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-soft)]">Go-to-market</p>
        <h2 id="usp-leverage-heading" className="mt-3 font-serif text-3xl md:text-4xl">
          How to leverage this USP
        </h2>
        <p className="mt-4 max-w-2xl text-white/70">
          Every touchpoint should repeat the same five-word promise:{" "}
          <strong className="text-white">{USP_TAGLINE}</strong> — then prove it with prompt review, export packs,
          and credit transparency.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {USP_LEVERAGE_PLAYS.map((play) => (
            <div key={play.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold">{play.title}</h3>
              <p className="mt-2 text-sm text-white/75">{play.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/login">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/compare">Full comparison</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
