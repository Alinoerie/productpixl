"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCalculator } from "@/components/pricing/credit-calculator";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { CREDIT_TOP_UP_PACKS, recommendTopUpPack } from "@/lib/pricing-plans";
import { typicalImageRunCredits } from "@/lib/credit-pricing";
import { Button } from "@/components/ui/button";

export function PricingCatalog({
  initialCredits,
  signedIn = true,
}: {
  initialCredits: number;
  checkoutEnabled: boolean;
  signedIn?: boolean;
}) {
  const [balance] = useLiveCredits(initialCredits);
  const [skus, setSkus] = useState(12);
  const [runsPerSku, setRunsPerSku] = useState(2);
  const creditsNeeded = useMemo(
    () => skus * runsPerSku * typicalImageRunCredits(),
    [skus, runsPerSku]
  );
  const recommended = recommendTopUpPack(balance, creditsNeeded);
  const recommendedPack = CREDIT_TOP_UP_PACKS.find((p) => p.key === recommended);

  return (
    <section aria-labelledby="estimate-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <h2 id="estimate-heading" className="font-serif text-xl md:text-2xl">
        Estimate your catalog
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
        Adjust SKUs and runs per SKU. We&apos;ll suggest a Starter or Catalog pack if your balance doesn&apos;t cover
        the estimate — buy any pack from the plans above.
      </p>
      <div className="mt-6">
        <CreditCalculator
          compact
          skus={skus}
          runsPerSku={runsPerSku}
          onSkusChange={setSkus}
          onRunsPerSkuChange={setRunsPerSku}
          currentCredits={balance}
        />
      </div>
      {recommendedPack && creditsNeeded > balance ? (
        <p className="mt-6 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-3 text-sm">
          This estimate needs about <strong>{creditsNeeded.toLocaleString()}</strong> credits — you have{" "}
          <strong>{balance.toLocaleString()}</strong>. The <strong>{recommendedPack.name}</strong> pack (
          {recommendedPack.price}) covers the gap.
        </p>
      ) : null}
      {!signedIn ? (
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/login?callbackUrl=/pricing">Sign in to see your balance</Link>
        </Button>
      ) : null}
    </section>
  );
}
