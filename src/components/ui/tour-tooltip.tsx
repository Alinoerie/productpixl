"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TourStep {
  title: string;
  text: string;
  target: string; // CSS selector or keyword to identify the target element
}

interface TourTooltipProps {
  steps: TourStep[];
  onComplete: () => void;
  storageKey?: string;
}

export function TourTooltip({ steps, onComplete, storageKey = "tour_seen" }: TourTooltipProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (seen) return;
    setVisible(true);
  }, [storageKey]);

  // Find target element when step changes
  useEffect(() => {
    if (!visible || !steps[current]) return;

    const findTarget = () => {
      const step = steps[current];
      // Try multiple selectors based on the step keyword
      const selectors = [
        `[data-tour="${step.target}"]`,
        `[id="${step.target}"]`,
        `[aria-label*="${step.target}"]`,
        step.target,
      ];

      for (const selector of selectors) {
        try {
          const el = document.querySelector(selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
            return;
          }
        } catch {
          // Invalid selector, skip
        }
      }
      setTargetRect(null);
    };

    // Small delay to allow render
    const timeout = setTimeout(findTarget, 100);
    window.addEventListener("resize", findTarget);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", findTarget);
    };
  }, [current, visible, steps]);

  const handleNext = () => {
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      localStorage.setItem(storageKey, "true");
      setVisible(false);
      onComplete();
    }
  };

  if (!visible) return null;

  const step = steps[current];
  const tooltipWidth = 280;
  const tooltipHeight = 120;

  // Position tooltip below or above target
  let top = targetRect ? targetRect.bottom + window.scrollY + 12 : 200;
  const left = targetRect
    ? Math.max(16, Math.min(targetRect.left + window.scrollX + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16))
    : window.innerWidth / 2 - tooltipWidth / 2;

  // Flip to above if not enough space below
  let arrowClass = "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[var(--accent)]";
  if (targetRect && targetRect.bottom > window.innerHeight - tooltipHeight - 100) {
    top = targetRect.top + window.scrollY - tooltipHeight - 12;
    arrowClass = "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[var(--accent)]";
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" aria-live="polite">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={handleNext} />

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="absolute rounded-xl border-2 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 pointer-events-none animate-pulse-soft"
          style={{
            top: targetRect.top + window.scrollY - 6,
            left: targetRect.left + window.scrollX - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute pointer-events-auto max-w-[280px] rounded-xl border border-[var(--accent)] bg-[var(--card)] shadow-xl p-4 animate-fade-up",
          "flex flex-col gap-2"
        )}
        style={{ top, left }}
        role="dialog"
        aria-label={`Tour step ${current + 1} of ${steps.length}`}
      >
        {/* Arrow */}
        <div
          className={cn("absolute w-0 h-0 border-8", arrowClass)}
          style={
            arrowClass.includes("top-full")
              ? { top: "100%", transform: "translateX(-50%)" }
              : { bottom: "100%", transform: "translateX(-50%)" }
          }
        />

        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          Step {current + 1} of {steps.length}
        </p>
        <p className="text-sm font-semibold">{step.title}</p>
        <p className="text-xs text-[var(--muted-fg)] leading-relaxed">{step.text}</p>

        <div className="flex items-center justify-between gap-3 mt-1">
          {/* Dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === current ? "bg-[var(--accent)]" : "bg-[var(--muted)]"
                )}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent)]/90 transition-colors"
          >
            {current < steps.length - 1 ? "Got it" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
