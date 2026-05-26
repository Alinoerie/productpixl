"use client";

import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { useLiveCredits } from "@/hooks/use-live-credits";
import {
  CREDIT_TOP_UP_PACKS,
  packAddsLine,
  recommendTopUpPack,
} from "@/lib/pricing-display";
import { cn } from "@/lib/utils";

export function PricingPacks({
  initialCredits,
  checkoutEnabled,
  creditsNeeded,
  signedIn = true,
}: {
  initialCredits: number;
  checkoutEnabled: boolean;
  creditsNeeded?: number;
  signedIn?: boolean;
}) {
  const [balance] = useLiveCredits(initialCredits);
  const needed = creditsNeeded ?? 0;
  const recommended = recommendTopUpPack(balance, needed);

  return (
    <div className="space-y-4">
      {recommended && creditsNeeded != null ? (
        <p className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-3 text-sm">
          {creditsNeeded > balance ? (
            <>
              This estimate needs about <strong>{needed.toLocaleString()}</strong> credits — you have{" "}
              <strong>{balance.toLocaleString()}</strong>. The{" "}
              <strong>{CREDIT_TOP_UP_PACKS.find((p) => p.key === recommended)?.name}</strong> pack covers the
              gap.
            </>
          ) : balance < 5 ? (
            <>
              You have <strong>{balance}</strong> credit{balance === 1 ? "" : "s"} left — the{" "}
              <strong>{CREDIT_TOP_UP_PACKS.find((p) => p.key === recommended)?.name}</strong> pack is a good
              fit for your next runs.
            </>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {CREDIT_TOP_UP_PACKS.map((p) => {
          const isRecommended = recommended === p.key;
          return (
            <Card
              key={p.key}
              className={cn(
                isRecommended
                  ? "relative border-[var(--accent)] shadow-[var(--shadow-md)] ring-2 ring-[var(--accent)]/30"
                  : p.tag
                    ? "relative border-[var(--accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--accent)]/20"
                    : ""
              )}
            >
              {isRecommended ? (
                <Badge className="absolute -top-2.5 left-4 bg-[var(--accent)]">Recommended for you</Badge>
              ) : p.tag ? (
                <Badge className="absolute -top-2.5 right-4">{p.tag}</Badge>
              ) : null}
              <CardHeader className={isRecommended ? "pt-8" : undefined}>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.name} pack</span>
                  <CreditCard className="h-5 w-5 text-[var(--muted-fg)]" strokeWidth={1.5} />
                </CardTitle>
                <p className="font-serif text-4xl">{p.price}</p>
                <p className="text-sm text-[var(--muted-fg)]">
                  {p.credits} credits · {packAddsLine(p.credits, balance)}
                </p>
                <p className="text-xs text-[var(--muted-fg)]">{p.perCredit} per credit</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    {p.credits} generation credits
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    Works for image studio and copy studio runs
                  </li>
                </ul>
                {signedIn ? (
                  <CheckoutButton
                    packageKey={p.key}
                    label={checkoutEnabled ? `Buy ${p.name} pack` : "Payments coming soon"}
                    checkoutEnabled={checkoutEnabled}
                  />
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login?callbackUrl=/pricing">Sign in — 10 free credits</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
