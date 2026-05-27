"use client";

import { cn } from "@/lib/utils";

export function PresetCardGrid<T extends { id: string; label: string }>({
  items,
  activeId,
  onSelect,
  brandPrimary,
  renderThumb,
  renderMeta,
}: {
  items: T[];
  activeId: string | null;
  onSelect: (id: string) => void;
  brandPrimary: string;
  renderThumb: (item: T) => React.ReactNode;
  renderMeta?: (item: T) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const selected = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "rounded-xl border bg-[var(--card)] p-3 text-left transition-all duration-150 hover:-translate-y-0.5",
              selected
                ? "border-transparent shadow-[0_0_0_2px_var(--brand-primary)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)]"
            )}
            style={{ ["--brand-primary" as string]: brandPrimary }}
          >
            {renderThumb(item)}
            <p className="mt-2 text-[13px] font-medium">{item.label}</p>
            {renderMeta ? <div className="mt-1 text-xs text-[var(--muted-fg)]">{renderMeta(item)}</div> : null}
          </button>
        );
      })}
    </div>
  );
}

export function VisualStyleThumb({ swatch }: { swatch: readonly string[] }) {
  return (
    <div className="flex h-10 w-full overflow-hidden rounded-md border border-[var(--border)]">
      {swatch.map((color, i) => (
        <div key={`${color}-${i}`} className="h-full flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
