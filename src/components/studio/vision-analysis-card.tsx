"use client";

import { Sparkles } from "lucide-react";
import type { ProductAnalysis } from "@/lib/ai";
import { usePanelEntrance } from "@/hooks/use-studio-gsap";
import { cn } from "@/lib/utils";

const FIELD_MAP: { key: keyof ProductAnalysis; label: string; intakeKey?: string }[] = [
  { key: "productName", label: "Product name", intakeKey: "name" },
  { key: "brandName", label: "Brand" },
  { key: "amazonCategory", label: "Category", intakeKey: "category" },
  { key: "materials", label: "Materials" },
  { key: "colors", label: "Colors" },
  { key: "dimensions", label: "Dimensions" },
  { key: "suggestedTargetBuyer", label: "Target buyer", intakeKey: "targetBuyer" },
  { key: "useCase", label: "Use case" },
  { key: "mood", label: "Vibe", intakeKey: "vibe" },
  { key: "differentiators", label: "Differentiators" },
];

export function VisionAnalysisCard({
  analysis,
  className,
}: {
  analysis: ProductAnalysis;
  className?: string;
}) {
  const ref = usePanelEntrance([analysis.productName]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--accent-soft)]/40 to-[var(--card)] p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-sm font-semibold">Vision analysis</p>
        <span className="ml-auto rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--success)]">
          Auto-filled
        </span>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {FIELD_MAP.map(({ key, label }) => {
          const val = analysis[key];
          if (!val || typeof val !== "string" || !val.trim()) return null;
          return (
            <div key={key} className="rounded-lg border border-[var(--border)]/60 bg-[var(--card)]/80 px-3 py-2">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-fg)]">{label}</dt>
              <dd className="mt-0.5 text-sm leading-snug">{val}</dd>
            </div>
          );
        })}
      </dl>
      {analysis.keyObservations ? (
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted-fg)]">{analysis.keyObservations}</p>
      ) : null}
    </div>
  );
}
