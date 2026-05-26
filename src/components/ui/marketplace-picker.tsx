"use client";

import { MARKETPLACES, type MarketplaceId } from "@/lib/marketplaces";
import { cn } from "@/lib/utils";

type MarketplacePickerProps = {
  value: MarketplaceId;
  onChange: (id: MarketplaceId) => void;
  noteField?: "copyNote" | "imageNote";
  name?: string;
  className?: string;
};

export function MarketplacePicker({
  value,
  onChange,
  noteField = "imageNote",
  name = "marketplace",
  className,
}: MarketplacePickerProps) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)} role="radiogroup" aria-label="Marketplace">
      {MARKETPLACES.map((m) => {
        const selected = value === m.id;
        return (
          <label
            key={m.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
              selected
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-[var(--shadow-sm)]"
                : "border-[var(--border)] hover:border-[var(--accent)]/40"
            )}
          >
            <input
              type="radio"
              name={name}
              className="mt-1"
              checked={selected}
              onChange={() => onChange(m.id)}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {m.flag} {m.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-fg)]">{m[noteField]}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
