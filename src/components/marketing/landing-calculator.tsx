import { CreditCalculator } from "@/components/pricing/credit-calculator";

export function LandingCalculator({ currentCredits = 0 }: { currentCredits?: number }) {
  return (
    <section id="calculator" className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Cost reality
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Pay for output, not seats</h2>
          <p className="mt-4 text-[var(--muted-fg)]">
            Early-stage sellers refresh 10–20 SKUs per quarter. Subscriptions punish you before you have
            revenue.
          </p>
        </div>
        <CreditCalculator currentCredits={currentCredits} />
      </div>
    </section>
  );
}
