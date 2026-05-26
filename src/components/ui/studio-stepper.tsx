"use client";

import { cn } from "@/lib/utils";

export function StudioStepper({
  steps,
  currentStep,
  label = "Progress",
  statusText,
  sticky = false,
}: {
  steps: string[];
  currentStep: number;
  label?: string;
  statusText?: string;
  sticky?: boolean;
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const stepLabel = steps[currentStep] ?? "";

  return (
    <div
      className={cn(
        "space-y-3",
        sticky &&
          "sticky top-14 z-20 -mx-4 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--muted-fg)]">
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-right text-[var(--foreground)]">
          {statusText ?? stepLabel}
        </span>
      </div>
      {statusText ? (
        <p className="text-xs text-[var(--muted-fg)]">
          Current step: <span className="font-medium text-[var(--foreground)]">{stepLabel}</span>
        </p>
      ) : null}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={
          statusText
            ? `${label}: step ${currentStep + 1} of ${steps.length}, ${stepLabel}, ${statusText}`
            : `${label}: step ${currentStep + 1} of ${steps.length}, ${stepLabel}`
        }
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2" aria-label={`${label} steps`}>
        {steps.map((step, i) => (
          <span
            key={step}
            aria-current={currentStep === i ? "step" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              currentStep === i
                ? "bg-[var(--accent)] text-white"
                : i < currentStep
                  ? "bg-[var(--success-bg)] text-[var(--success)]"
                  : "bg-[var(--muted)] text-[var(--muted-fg)]"
            )}
          >
            {i < currentStep ? "✓ " : ""}
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
