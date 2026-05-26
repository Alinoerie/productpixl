import { Check, Clock, CreditCard, Globe } from "lucide-react";
import { USP_PILLARS, USP_TAGLINE, USP_VS_MARKET } from "@/lib/marketing-usp";

export function LandingCompare() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--ink)] px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{USP_TAGLINE}</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            Launch creative before catalog-sync tools can touch your SKU
          </h2>
          <p className="mt-4 text-white/70">
            {USP_VS_MARKET.catalogSyncTools.label} and {USP_VS_MARKET.asinTools.label} solve different problems.
            ProductPixl owns the pre-listing moment.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/60">Typical alternatives</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {[...USP_VS_MARKET.asinTools.weaknesses.slice(0, 2), ...USP_VS_MARKET.catalogSyncTools.weaknesses.slice(0, 2)].map(
                (item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/40">—</span>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-6">
            <p className="text-sm font-medium text-[var(--accent-soft)]">{USP_VS_MARKET.productPixl.label}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {USP_VS_MARKET.productPixl.strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {USP_PILLARS.slice(1, 4).map((pillar, i) => {
            const icons = [CreditCard, Globe, Clock] as const;
            const Icon = icons[i] ?? CreditCard;
            return (
              <div key={pillar.id} className="flex gap-4 rounded-xl border border-white/10 p-4">
                <Icon className="h-6 w-6 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold">{pillar.title}</p>
                  <p className="mt-1 text-sm text-white/70">{pillar.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
