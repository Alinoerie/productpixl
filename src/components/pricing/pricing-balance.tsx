"use client";

import Link from "next/link";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PricingBalance({ initialCredits }: { initialCredits: number }) {
  const [credits] = useLiveCredits(initialCredits);
  const low = credits < 2;

  return (
    <Card className={low ? "border-[var(--warning-border)] bg-[var(--warning-bg)]/40" : "border-[var(--accent)]/20 bg-[var(--accent-soft)]/25"}>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Your balance</p>
          <p className="mt-1 font-serif text-3xl">{credits}</p>
          <p className="text-sm text-[var(--muted-fg)]">
            {low ? "Running low — top up before your next run" : "Studio shows credits required before each run"}
          </p>
        </div>
        <Button asChild variant={low ? "default" : "outline"}>
          <Link href="/account">View account</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
