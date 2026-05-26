"use client";

import { Check, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { cn } from "@/lib/utils";

const packs = [
  {
    key: "starter" as const,
    name: "Starter",
    credits: 10,
    price: "€29",
    per: "€2.90",
    tag: null as string | null,
  },
  {
    key: "growth" as const,
    name: "Growth",
    credits: 30,
    price: "€79",
    per: "€2.63",
    tag: "Best value",
  },
];

function recommendPack(balance: number, creditsNeeded: number) {
  const deficit = Math.max(0, creditsNeeded - balance);
  if (deficit === 0 && balance >= 5) return null;
  if (deficit <= 10 || balance < 5) return "starter" as const;
  return "growth" as const;
}

export function PricingPacks({
  initialCredits,
  checkoutEnabled,
  creditsNeeded,
}: {
  initialCredits: number;
  checkoutEnabled: boolean;
  creditsNeeded?: number;
}) {
  const [balance] = useLiveCredits(initialCredits);
  const needed = creditsNeeded ?? 0;
  const recommended = recommendPack(balance, needed);

  return (
    <div className="space-y-4">
      {recommended ? (
        <p className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-3 text-sm">
          {creditsNeeded != null && creditsNeeded > balance ? (
            <>
              Your plan needs <strong>{creditsNeeded - balance}</strong> more credit
              {creditsNeeded - balance === 1 ? "" : "s"} — the{" "}
              <strong>{packs.find((p) => p.key === recommended)?.name}</strong> pack is the best fit.
            </>
          ) : balance < 5 ? (
            <>
              You have <strong>{balance}</strong> credit{balance === 1 ? "" : "s"} left — the{" "}
              <strong>{packs.find((p) => p.key === recommended)?.name}</strong> pack covers your next runs.
            </>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {packs.map((p) => {
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
                  <span>{p.name}</span>
                  <CreditCard className="h-5 w-5 text-[var(--muted-fg)]" strokeWidth={1.5} />
                </CardTitle>
                <p className="font-serif text-4xl">{p.price}</p>
                <p className="text-sm text-[var(--muted-fg)]">
                  {p.per} per credit · {p.credits + balance} total after purchase
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    {p.credits} generation credits
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    Image pipeline or copy per credit
                  </li>
                </ul>
                <CheckoutButton packageKey={p.key} label={`Buy ${p.name}`} checkoutEnabled={checkoutEnabled} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
