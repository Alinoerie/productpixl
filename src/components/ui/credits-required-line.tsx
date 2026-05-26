"use client";

import { formatCreditsRequired } from "@/lib/credit-pricing";

export function CreditsRequiredLine({
  total,
  detailLine,
  className,
}: {
  total: number;
  detailLine?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <strong className="text-[var(--foreground)]">{formatCreditsRequired(total)}</strong>
      {detailLine ? (
        <span className="mt-1 block text-xs font-normal text-[var(--muted-fg)]">{detailLine}</span>
      ) : null}
    </span>
  );
}
