"use client";

import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";

export function MarketplaceGuidance({
  marketplaceId,
  variant = "copy",
}: {
  marketplaceId: MarketplaceId;
  variant?: "copy" | "images" | "both";
}) {
  const mp = getMarketplace(marketplaceId);

  return (
    <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
      <p className="font-medium">
        {mp.flag} {mp.label} — {variant === "images" ? "gallery rules" : variant === "both" ? "listing rules" : "copy rules"}
      </p>
      {variant !== "images" ? (
        <p className="mt-1 text-[var(--muted-fg)]">{mp.copyNote}</p>
      ) : null}
      {variant !== "copy" ? (
        <p className={variant === "both" ? "mt-2 text-[var(--muted-fg)]" : "mt-1 text-[var(--muted-fg)]"}>
          {mp.imageNote}
        </p>
      ) : null}
      {mp.rufusOptimized && variant !== "images" ? (
        <p className="mt-2 text-xs font-medium text-[var(--teal)]">RUFUS-optimized generation enabled</p>
      ) : null}
    </div>
  );
}
