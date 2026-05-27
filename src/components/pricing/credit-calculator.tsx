"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { typicalImageRunCredits } from "@/lib/credit-pricing";
import { formatCreditBalance, showCalculatorBalance } from "@/lib/pricing-display";

const AGENCY_PER_SKU = 150;

export function CreditCalculator({
  compact = false,
  skus: controlledSkus,
  runsPerSku: controlledRuns,
  onSkusChange,
  onRunsPerSkuChange,
  currentCredits = 0,
  onDeficitChange,
}: {
  compact?: boolean;
  skus?: number;
  runsPerSku?: number;
  onSkusChange?: (value: number) => void;
  onRunsPerSkuChange?: (value: number) => void;
  currentCredits?: number;
  onDeficitChange?: (deficit: number) => void;
}) {
  const skus = controlledSkus ?? 12;
  const runsPerSku = controlledRuns ?? 2;
  const creditsPerRun = typicalImageRunCredits();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Detect signed-in state by checking if currentCredits was explicitly provided
    // (as opposed to the default 0 for anonymous users)
    setIsSignedIn(currentCredits > 0 || showCalculatorBalance(currentCredits));
  }, [currentCredits]);

  const totalCredits = useMemo(
    () => skus * runsPerSku * creditsPerRun,
    [skus, runsPerSku, creditsPerRun]
  );

  const deficit = Math.max(0, totalCredits - currentCredits);
  const agency = skus * AGENCY_PER_SKU;
  const showBalance = showCalculatorBalance(currentCredits);

  // Notify parent when deficit changes (for analytics or other side effects)
  useEffect(() => {
    onDeficitChange?.(deficit);
  }, [deficit, onDeficitChange]);

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
            <Label htmlFor="calc-runs">Image runs per SKU</Label>
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
          Uses a typical US image run (~{creditsPerRun} credits). Copy-only runs cost less. Actual totals depend
          on modules, marketplace, and product detail.
          {showBalance ? (
            <> You have {formatCreditBalance(currentCredits)} credits today.</>
          ) : (
            <> Your current balance is more than enough for this estimate.</>
          )}
        </p>
        {showBalance && deficit > 0 ? (
          <p className="mt-2 text-xs font-medium text-[var(--accent)]">
            About {formatCreditBalance(totalCredits)} credits needed — roughly{" "}
            {formatCreditBalance(deficit)} more after your balance.
          </p>
        ) : showBalance ? (
          <p className="mt-2 text-xs font-medium text-[var(--success)]">
            Your balance covers this estimate (~{formatCreditBalance(totalCredits)} credits).
          </p>
        ) : null}
      </div>
      <div className="grid gap-4">
        <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-soft)]/30 p-6">
          <p className="text-sm font-medium text-[var(--accent)]">ProductPixl estimate</p>
          <p className="mt-2 font-serif text-4xl">~{formatCreditBalance(totalCredits)}</p>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            credits · only charged when you generate
          </p>
          {isSignedIn && deficit > 0 ? (
            <div className="mt-4">
              <Button asChild size="sm" className="w-full rounded-xl">
                <Link href="/pricing">
                  Buy credits
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
        {!compact && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 opacity-90">
            <p className="text-sm text-[var(--muted-fg)]">Traditional agency ({skus} SKUs)</p>
            <p className="mt-2 font-serif text-3xl">~€{agency.toLocaleString()}</p>
            <p className="mt-1 text-xs text-[var(--muted-fg)]">One-off photoshoots · weeks of lead time</p>
          </div>
        )}
      </div>
    </div>
  );
}
