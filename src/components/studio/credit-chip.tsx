"use client";

import { cn } from "@/lib/utils";

export function creditOrbColor(credits: number): string {
  if (credits >= 500) return "bg-[var(--success)]";
  if (credits >= 50) return "bg-[var(--warning)]";
  return "bg-[var(--error)]";
}

export function CreditChip({
  credits,
  className,
  size = "sm",
}: {
  credits: number;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", creditOrbColor(credits))} aria-hidden />
      {credits.toLocaleString()} cr
    </span>
  );
}
