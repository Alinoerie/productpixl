import { cn } from "@/lib/utils";
import { charCountLabel } from "@/lib/amazon-limits";

export function CharCounter({
  value,
  max,
  className,
  id,
}: {
  value: string;
  max: number;
  className?: string;
  id?: string;
}) {
  const { label, over } = charCountLabel(value, max);
  return (
    <span
      id={id}
      aria-live={over ? "polite" : undefined}
      className={cn(
        "text-xs tabular-nums",
        over ? "font-medium text-[var(--error)]" : "text-[var(--muted-fg)]",
        className
      )}
    >
      {label}
    </span>
  );
}

export function LimitWarning({ message }: { message: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning)]"
    >
      {message}
    </p>
  );
}
