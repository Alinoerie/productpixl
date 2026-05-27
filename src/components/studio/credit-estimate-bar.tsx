"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUpStat } from "@/components/studio/count-up-stat";
import { cn } from "@/lib/utils";

export function CreditEstimateBar({
  modules,
  total,
  caveat,
  ctaLabel,
  onCta,
  disabled,
  loading,
  loadingLabel = "Generating…",
  className,
}: {
  modules: { label: string; credits: number }[];
  total: number;
  caveat?: string;
  ctaLabel: string;
  onCta: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-[var(--mobile-nav-offset)] z-20 -mx-4 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-md md:static md:mx-0 md:rounded-2xl md:border md:backdrop-blur-none",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {modules.map((m) => (
          <span
            key={m.label}
            className="rounded-full border border-[var(--border)] bg-[var(--muted)]/30 px-2.5 py-1 text-[11px] font-medium"
          >
            {m.label} · {m.credits} cr
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted-fg)]">Estimated total</p>
          <p className="font-serif text-3xl tabular-nums">
            <CountUpStat value={total} /> <span className="text-base font-sans text-[var(--muted-fg)]">credits</span>
          </p>
          {caveat ? <p className="mt-1 text-xs text-[var(--muted-fg)]">{caveat}</p> : null}
        </div>
        <Button
          className="h-12 min-w-[200px] flex-1 rounded-xl text-base md:flex-none"
          disabled={disabled || loading}
          onClick={onCta}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {loadingLabel}
            </>
          ) : (
            ctaLabel
          )}
        </Button>
      </div>
    </div>
  );
}
