"use client";

import { cn } from "@/lib/utils";

export type BrandSectionId = "identity" | "visual" | "copy" | "rules" | "preview";

export type SectionNavItem = {
  id: BrandSectionId;
  label: string;
  badge?: string;
  incomplete?: boolean;
  unsaved?: boolean;
};

export function BrandKitSectionNav({
  items,
  activeId,
  onSelect,
  className,
}: {
  items: SectionNavItem[];
  activeId: BrandSectionId;
  onSelect: (id: BrandSectionId) => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Brand kit sections">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <span className="flex-1 truncate">
              {item.label}
              {item.badge ? <span className="text-[var(--muted-fg)]"> · {item.badge}</span> : null}
            </span>
            {item.unsaved ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--warning)]" title="Unsaved changes" />
            ) : null}
            {item.incomplete ? (
              <span className="shrink-0 rounded bg-[var(--warning-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
                !
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function BrandKitMobileTabs({
  items,
  activeId,
  onSelect,
}: {
  items: SectionNavItem[];
  activeId: BrandSectionId;
  onSelect: (id: BrandSectionId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
            item.id === activeId
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted-fg)]"
          )}
        >
          {item.label}
          {item.badge ? ` · ${item.badge}` : ""}
        </button>
      ))}
    </div>
  );
}
