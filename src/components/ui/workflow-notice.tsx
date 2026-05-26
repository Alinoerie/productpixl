"use client";

import Link from "next/link";
import { CreditBadge } from "@/components/layout/credit-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WorkflowNotice({
  initialCredits,
  costLabel = "1 credit",
  description,
}: {
  initialCredits: number;
  costLabel?: string;
  description: string;
}) {
  const low = initialCredits < 1;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 shadow-[var(--shadow-sm)]",
        low
          ? "border-amber-300/60 bg-[var(--warning-bg)]"
          : "border-[var(--border)] bg-[var(--card)]"
      )}
    >
      <div className="min-w-0">
        <p className="text-sm text-[var(--muted-fg)]">{description}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--foreground)]">
          This run costs <span className="text-[var(--accent)]">{costLabel}</span>
          {low ? (
            <>
              {" "}
              ·{" "}
              <Link href="/pricing" className="text-[var(--accent)] underline-offset-2 hover:underline">
                You need more credits
              </Link>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CreditBadge initialCredits={initialCredits} />
        <Button asChild variant="outline" size="sm">
          <Link href="/pricing">Buy credits</Link>
        </Button>
      </div>
    </div>
  );
}
