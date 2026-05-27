"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";

export type StepRailItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export function StepRail({
  steps,
  currentIndex,
  className,
}: {
  steps: StepRailItem[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <nav className={cn("relative flex items-start justify-between gap-2", className)} aria-label="Generation progress steps">
      <div
        className="absolute left-[12%] right-[12%] top-5 h-px bg-[var(--border)]"
        aria-hidden
      />
      <div
        className={cn(
          "absolute left-[12%] top-5 h-px bg-[var(--accent)] transition-all",
          STUDIO_TRANSITION.panel
        )}
        style={{ width: `${steps.length <= 1 ? 0 : (currentIndex / (steps.length - 1)) * 76}%` }}
        aria-hidden
      />
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.id} className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                STUDIO_TRANSITION.micro,
                done && "border-[var(--accent)] bg-[var(--accent)] text-white",
                active && "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] ring-4 ring-[var(--accent)]/20 motion-reduce:ring-0",
                !done && !active && "border-[var(--border)] bg-[var(--card)] text-[var(--muted-fg)]"
              )}
              aria-current={active ? "step" : undefined}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "max-w-[7rem] text-[11px] font-medium leading-tight",
                active ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
