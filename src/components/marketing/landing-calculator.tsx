"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PIXII_MONTHLY = 207;
const AGENCY_PER_SKU = 150;
const CREDIT_PACK = 2.63; // Growth pack per-credit price (€79 / 30)

export function LandingCalculator() {
  const [skus, setSkus] = useState(12);
  const [runsPerSku, setRunsPerSku] = useState(2);

  const productPixl = useMemo(() => {
    const credits = skus * runsPerSku;
    return Math.round(credits * CREDIT_PACK);
  }, [skus, runsPerSku]);

  const pixii = PIXII_MONTHLY * 12;
  const agency = skus * AGENCY_PER_SKU;

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
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SKUs this quarter</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={skus}
                  onChange={(e) => setSkus(Number(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Pipeline runs per SKU</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={runsPerSku}
                  onChange={(e) => setRunsPerSku(Number(e.target.value) || 1)}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--muted-fg)]">
              Uses Growth pack pricing (~€{CREDIT_PACK}/credit). You start with 10 free credits.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-soft)]/30 p-6">
              <p className="text-sm font-medium text-[var(--accent)]">ProductPixl (credits)</p>
              <p className="mt-2 font-serif text-4xl">~€{productPixl}</p>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">Only when you generate</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 opacity-90">
              <p className="text-sm text-[var(--muted-fg)]">Pixii Growth (12 mo)</p>
              <p className="mt-2 font-serif text-3xl line-through decoration-[var(--accent)]">
                €{pixii.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 opacity-90">
              <p className="text-sm text-[var(--muted-fg)]">Freelance agency ({skus} SKUs)</p>
              <p className="mt-2 font-serif text-3xl">~€{agency.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
