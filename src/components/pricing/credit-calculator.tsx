"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PIXII_MONTHLY = 207;
const AGENCY_PER_SKU = 150;
const CREDIT_PACK = 2.63;

export function CreditCalculator({ compact = false }: { compact?: boolean }) {
  const [skus, setSkus] = useState(12);
  const [runsPerSku, setRunsPerSku] = useState(2);

  const productPixl = useMemo(() => {
    const credits = skus * runsPerSku;
    return Math.round(credits * CREDIT_PACK);
  }, [skus, runsPerSku]);

  const pixii = PIXII_MONTHLY * 12;
  const agency = skus * AGENCY_PER_SKU;

  return (
    <div className={compact ? "grid gap-6 lg:grid-cols-2" : "mt-10 grid gap-8 lg:grid-cols-2"}>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="calc-skus">SKUs this quarter</Label>
            <Input
              id="calc-skus"
              type="number"
              min={1}
              max={500}
              value={skus}
              onChange={(e) => setSkus(Number(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="calc-runs">Pipeline runs per SKU</Label>
            <Input
              id="calc-runs"
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
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            {skus * runsPerSku} credits · only when you generate
          </p>
        </div>
        {!compact && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
