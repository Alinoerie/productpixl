"use client";

import { cn } from "@/lib/utils";

export function StudioStepper({
  steps,
  currentStep,
  label = "Progress",
}: {
  steps: string[];
  currentStep: number;
  label?: string;
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const stepLabel = steps[currentStep] ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-fg)]">
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-[var(--foreground)]">{stepLabel}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`${label}: step ${currentStep + 1} of ${steps.length}, ${stepLabel}`}
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
