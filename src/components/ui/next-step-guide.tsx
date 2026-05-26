import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NextStepGuide({
  step,
  title,
  body,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  variant = "default",
  className,
}: {
  step?: string;
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  variant?: "default" | "accent" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-sm)] md:p-6",
        variant === "accent" && "border-[var(--accent)]/30 bg-[var(--accent-soft)]/30",
        variant === "muted" && "border-[var(--border)] bg-[var(--muted)]/30",
        variant === "default" && "border-[var(--border)] bg-[var(--card)]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          {step ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{step}</p>
          ) : null}
          <h2 className={cn("font-semibold", step ? "mt-2" : "")}>{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
