"use client";

import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";

export function FlagCard({
  selected,
  onClick,
  flag,
  title,
  subtitle,
  badge,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  flag: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-16 min-w-[100px] shrink-0 flex-col rounded-xl border bg-[var(--card)] p-2.5 text-left transition-all hover:-translate-y-0.5 motion-reduce:transform-none",
        STUDIO_TRANSITION.lift,
        selected
          ? "border-[var(--brand-primary,var(--accent))] shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand-primary,var(--accent))_35%,transparent)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]",
        className
      )}
    >
      <span className="absolute right-2 top-2">{flag}</span>
      {badge ? (
        <span className="mb-1 w-fit rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--accent)]">
          {badge}
        </span>
      ) : null}
      <span className="mt-auto text-xs font-semibold leading-tight">{title}</span>
      {subtitle ? <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--muted-fg)]">{subtitle}</span> : null}
    </button>
  );
}
