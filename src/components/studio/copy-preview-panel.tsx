"use client";

import { useMemo } from "react";
import { AMAZON_TITLE_MAX } from "@/lib/amazon-limits";
import { computeRufusScore, type CopyDraft } from "@/stores/copy-studio-store";
import { useBrandStore } from "@/stores/brand-store";
import { cn } from "@/lib/utils";

export function CopyPreviewPanel({
  draft,
  showDescription = false,
  onToggleDescription,
  className,
}: {
  draft: CopyDraft;
  showDescription?: boolean;
  onToggleDescription?: () => void;
  className?: string;
}) {
  const profile = useBrandStore((s) => s.profile);
  const score = useMemo(() => computeRufusScore(draft), [draft]);
  const titleLen = draft.title.length;
  const scoreColor =
    score >= 70 ? "text-[var(--success)] bg-[var(--success-bg)]" : score >= 45 ? "text-[var(--warning)] bg-[var(--warning-bg)]" : "text-[var(--error)] bg-[var(--error-bg)]";

  return (
    <div
      className={cn("rounded-xl border border-[var(--border)] bg-white p-4 font-[Inter,system-ui,sans-serif] text-[#0f1111] shadow-sm dark:bg-[#0f1111] dark:text-[#f7fafa]", className)}
      style={{ ["--brand-primary" as string]: profile.primaryColor }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-fg)] dark:text-[#888]">
          Amazon PDP preview
        </p>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", scoreColor)}>
          <span>R</span> {score}
        </span>
      </div>
      <div className="space-y-1">
        <p
          className={cn(
            "text-base font-normal leading-snug",
            titleLen >= 180 && titleLen < AMAZON_TITLE_MAX && "text-amber-600",
            titleLen >= AMAZON_TITLE_MAX && "text-red-600"
          )}
        >
          {draft.title.trim() || "Your product title appears here as you type…"}
        </p>
        <p
          className={cn(
            "text-[10px]",
            titleLen >= 180 ? (titleLen >= AMAZON_TITLE_MAX ? "text-red-500" : "text-amber-600") : "text-[var(--muted-fg)]"
          )}
        >
          {titleLen}/{AMAZON_TITLE_MAX}
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {(draft.bullets.length ? draft.bullets : ["", "", "", "", ""]).slice(0, 5).map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0f1111] dark:bg-[#f7fafa]" />
            <span className={cn(!bullet.trim() && "text-[var(--muted-fg)] italic")}>
              {bullet.trim() || `Bullet ${i + 1}…`}
            </span>
          </li>
        ))}
      </ul>
      {onToggleDescription ? (
        <button
          type="button"
          className="mt-4 text-xs font-medium text-[var(--accent)]"
          onClick={onToggleDescription}
        >
          {showDescription ? "Hide description" : "Show description"}
        </button>
      ) : null}
      {showDescription && draft.description ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)] dark:text-[#aaa]">{draft.description}</p>
      ) : null}
      {draft.backendKeywords ? (
        <div className="mt-4 border-t border-[var(--border)] pt-3 dark:border-[#333]">
          <p className="text-[10px] font-semibold uppercase text-[var(--muted-fg)]">Backend keywords</p>
          <p className="mt-1 text-xs text-[var(--muted-fg)] dark:text-[#aaa]">{draft.backendKeywords}</p>
        </div>
      ) : null}
    </div>
  );
}
