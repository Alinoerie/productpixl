"use client";

import { cn } from "@/lib/utils";

export function FloatingLabelField({
  id,
  label,
  value,
  onChange,
  disabled,
  multiline,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  const filled = value.trim().length > 0;
  const shared =
    "peer w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 pt-5 pb-2 text-sm outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-60";

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 z-10 origin-left text-[var(--muted-fg)] transition-all",
          filled
            ? "top-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]"
            : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-[var(--accent)]"
        )}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={cn(shared, "min-h-[88px] resize-y")}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={shared}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
