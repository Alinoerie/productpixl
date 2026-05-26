"use client";

import { useMemo, useState } from "react";
import { CreditCalculator } from "@/components/pricing/credit-calculator";
import { PricingPacks } from "@/components/pricing/pricing-packs";

export function PricingCatalog({
  initialCredits,
  checkoutEnabled,
}: {
  initialCredits: number;
  checkoutEnabled: boolean;
}) {
  const [skus, setSkus] = useState(12);
  const [runsPerSku, setRunsPerSku] = useState(2);
  const creditsNeeded = useMemo(() => skus * runsPerSku, [skus, runsPerSku]);

  return (
    <>
      <PricingPacks
        initialCredits={initialCredits}
        checkoutEnabled={checkoutEnabled}
        creditsNeeded={creditsNeeded}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-6 md:p-8">
        <h2 className="font-serif text-xl">Estimate your catalog cost</h2>
        <p className="mt-2 text-sm text-[var(--muted-fg)]">
          Adjust SKUs and runs — pack recommendation updates based on your balance.
        </p>
        <CreditCalculator
          compact
          skus={skus}
          runsPerSku={runsPerSku}
          onSkusChange={setSkus}
          onRunsPerSkuChange={setRunsPerSku}
          currentCredits={initialCredits}
        />
      </div>
    </>
  );
}
