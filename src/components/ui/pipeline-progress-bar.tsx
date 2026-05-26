"use client";

import { formatPipelinePhase } from "@/lib/status-labels";
import {
  formatElapsed,
  pipelineProgressPercent,
  type PipelineStatusShape,
} from "@/lib/pipeline-progress";
import { PIPELINE_ERROR, SUPPORT_EMAIL } from "@/lib/pipeline-errors";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function PipelineProgressBar({
  status,
  pipelineStatus,
  queuedStale = false,
  compact = false,
  className,
}: {
  status: string;
  pipelineStatus?: PipelineStatusShape | null;
  queuedStale?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const percent = pipelineProgressPercent(status, pipelineStatus ?? null);
  const phaseLabel =
    status === "QUEUED"
      ? queuedStale
        ? "Run hasn't started"
        : "Starting your run…"
      : formatPipelinePhase(pipelineStatus?.phase ?? status);

  const elapsed = formatElapsed(pipelineStatus?.startedAt);
  const stepLabel =
    pipelineStatus?.phase === "GENERATING" && pipelineStatus.steps.length
      ? (pipelineStatus.steps.find((s) => s.status === "GENERATING")?.label ??
        `${pipelineStatus.steps.filter((s) => s.status === "COMPLETE").length}/${pipelineStatus.steps.length} modules`)
      : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn("font-medium", queuedStale && "text-[var(--warning)]")}>
          {phaseLabel}
          {stepLabel ? ` · ${stepLabel}` : null}
        </span>
        {!compact && elapsed ? (
          <span className="tabular-nums text-[var(--muted-fg)]">{elapsed}</span>
        ) : null}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Generation progress: ${percent}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            queuedStale
              ? "bg-[var(--warning)]"
              : status === "FAILED"
                ? "bg-[var(--error)]"
                : "bg-[var(--accent)]"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {queuedStale ? (
        <p className="flex items-start gap-1.5 text-[11px] text-[var(--warning)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {PIPELINE_ERROR.queuedStale}{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("ProductPixl run stuck")}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            Contact support
          </a>
        </p>
      ) : null}
    </div>
  );
}
