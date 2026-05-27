"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { CreditChip, creditOrbColor } from "@/components/studio/credit-chip";
import { cn } from "@/lib/utils";

export function CreditWidget({
  initialCredits,
  planName = "Studio plan",
}: {
  initialCredits: number;
  planName?: string;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const { ok, data } = await fetchJson<{ credits?: number }>("/api/credits");
    if (ok && typeof data.credits === "number") setCredits(data.credits);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("credits-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("credits-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const usedEstimate = Math.max(0, Math.min(credits, Math.round(credits * 0.15)));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pl-2 pr-3 text-sm shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
        aria-expanded={open}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full", creditOrbColor(credits))} />
        <span className="font-semibold tabular-nums">{credits.toLocaleString()}</span>
        <span className="text-[var(--muted-fg)]">credits</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">{planName}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums">{credits.toLocaleString()}</p>
          <p className="mt-2 text-xs text-[var(--muted-fg)]">
            ~{usedEstimate} used this month · resets on the 1st
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            onClick={() => setOpen(false)}
          >
            Top up credits →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/** Compact chip for tab hover tooltips */
export function CreditCostHint({ credits }: { credits: number }) {
  return <CreditChip credits={credits} className="opacity-0 transition-opacity group-hover:opacity-100" />;
}
