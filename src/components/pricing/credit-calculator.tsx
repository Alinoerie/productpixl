"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { typicalImageRunCredits } from "@/lib/credit-pricing";

const PIXII_MONTHLY = 207;
const AGENCY_PER_SKU = 150;

export function CreditCalculator({
  compact = false,
  skus: controlledSkus,
  runsPerSku: controlledRuns,
  onSkusChange,
  onRunsPerSkuChange,
  currentCredits = 0,
}: {
  compact?: boolean;
  skus?: number;
  runsPerSku?: number;
  onSkusChange?: (value: number) => void;
  onRunsPerSkuChange?: (value: number) => void;
  currentCredits?: number;
}) {
  const skus = controlledSkus ?? 12;
  const runsPerSku = controlledRuns ?? 2;
  const creditsPerRun = typicalImageRunCredits();

  const productPixl = useMemo(() => {
    const credits = skus * runsPerSku * creditsPerRun;
    return credits;
  }, [skus, runsPerSku, creditsPerRun]);

  const totalCredits = skus * runsPerSku * creditsPerRun;
  const deficit = Math.max(0, totalCredits - currentCredits);
  const pixii = PIXII_MONTHLY * 12;
  const agency = skus * AGENCY_PER_SKU;

  return (
    <div className={compact ? "mt-6 grid gap-6 lg:grid-cols-2" : "mt-10 grid gap-8 lg:grid-cols-2"}>
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
              onChange={(e) => onSkusChange?.(Number(e.target.value) || 1)}
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
              onChange={(e) => onRunsPerSkuChange?.(Number(e.target.value) || 1)}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-fg)]">
          Estimate uses a typical US image run (~{creditsPerRun} credits). Actual totals vary by modules,
          marketplace, and product detail. You have {currentCredits.toLocaleString()} credits today.
        </p>
        {deficit > 0 ? (
          <p className="mt-2 text-xs font-medium text-[var(--accent)]">
            Plan requires ~{totalCredits.toLocaleString()} credits — you need ~{deficit.toLocaleString()} more after
            your current balance.
          </p>
        ) : (
          <p className="mt-2 text-xs font-medium text-[var(--success)]">
            Your balance covers this estimate (~{totalCredits.toLocaleString()} credits needed).
          </p>
        )}
      </div>
      <div className="grid gap-4">
        <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-soft)]/30 p-6">
          <p className="text-sm font-medium text-[var(--accent)]">ProductPixl (estimated credits)</p>
          <p className="mt-2 font-serif text-4xl">~{productPixl.toLocaleString()}</p>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            {totalCredits.toLocaleString()} credits · only when you generate
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
