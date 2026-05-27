"use client";

import { MARKETPLACES, type MarketplaceId } from "@/lib/marketplaces";
import { FlagCard } from "@/components/studio/flag-card";
import { cn } from "@/lib/utils";

type MarketplacePickerProps = {
  value: MarketplaceId;
  onChange: (id: MarketplaceId) => void;
  noteField?: "copyNote" | "imageNote";
  name?: string;
  className?: string;
  multi?: boolean;
  values?: MarketplaceId[];
  onMultiChange?: (ids: MarketplaceId[]) => void;
};

export function MarketplacePicker({
  value,
  onChange,
  noteField = "imageNote",
  className,
  multi = false,
  values = [],
  onMultiChange,
}: MarketplacePickerProps) {
  const selectedSet = new Set(multi ? values : [value]);

  function toggle(id: MarketplaceId) {
    if (!multi || !onMultiChange) {
      onChange(id);
      return;
    }
    const next = selectedSet.has(id) ? values.filter((v) => v !== id) : [...values, id];
    onMultiChange(next.length ? next : [id]);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="radiogroup" aria-label="Marketplace">
        {MARKETPLACES.map((m) => (
          <FlagCard
            key={m.id}
            selected={selectedSet.has(m.id)}
            onClick={() => toggle(m.id)}
            flag={<span className="text-base leading-none">{m.flag}</span>}
            title={m.label.replace("Amazon ", "Amazon ")}
            subtitle={m[noteField]}
            badge={m.rufusOptimized ? "RUFUS" : undefined}
          />
        ))}
      </div>
      {multi && values.length > 1 ? (
        <p className="text-xs text-[var(--muted-fg)]">+{values.length - 1} languages · credit estimate updates per market</p>
      ) : null}
    </div>
  );
}
