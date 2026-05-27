"use client";

import { useBrandStore } from "@/stores/brand-store";
import { cn } from "@/lib/utils";

const SLOTS = [
  { id: "hero", label: "Hero", size: "2000×2000px", module: "L1" },
  { id: "lifestyle", label: "Lifestyle", size: "2000×2000px", module: "L3" },
  { id: "detail", label: "Detail", size: "2000×2000px", module: "L4" },
] as const;

export function ModulePreviewPanel({
  previewUrl,
  outputs,
  className,
}: {
  previewUrl?: string;
  outputs?: { moduleId: string; imageUrl?: string | null }[];
  className?: string;
}) {
  const profile = useBrandStore((s) => s.profile);
  const primary = profile.primaryColor ?? "#6366f1";
  const secondary = profile.secondaryColor ?? "#0891b2";

  return (
    <div className={cn("grid gap-3", className)}>
      {SLOTS.map((slot) => {
        const out = outputs?.find((o) => o.moduleId === slot.module || o.moduleId === slot.id);
        return (
          <div
            key={slot.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)]"
            style={{
              background: out?.imageUrl
                ? undefined
                : `linear-gradient(145deg, ${primary}33, ${secondary}44)`,
            }}
          >
            {out?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={out.imageUrl} alt={slot.label} className="h-full w-full object-cover" />
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-contain opacity-30" />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs font-semibold text-white">{slot.label}</p>
              <p className="text-[10px] text-white/70">{slot.size}</p>
            </div>
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-white/80"
              style={{ backgroundColor: primary }}
            />
          </div>
        );
      })}
    </div>
  );
}
