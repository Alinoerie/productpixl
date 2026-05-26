export type PipelineStepState = {
  id: string;
  label: string;
  status: "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";
  imageUrl?: string;
  qaScore?: number;
  prompt?: string;
  error?: string;
};

export type PipelineStatusShape = {
  phase: string;
  steps: PipelineStepState[];
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
};

const PHASE_BASE: Record<string, number> = {
  RECEIVING: 8,
  ANALYZING: 22,
  RESEARCHING: 36,
  SELECTING: 48,
  GENERATING: 55,
  QA: 92,
  COMPLETE: 100,
  FAILED: 100,
};

/** 0–100 progress for UI bars. */
export function pipelineProgressPercent(
  status: string,
  pipelineStatus: PipelineStatusShape | null | undefined
): number {
  if (status === "COMPLETE") return 100;
  if (status === "FAILED") return 100;
  if (status === "QUEUED" || !pipelineStatus) return 4;

  let base = PHASE_BASE[pipelineStatus.phase] ?? 10;

  if (pipelineStatus.phase === "GENERATING" && pipelineStatus.steps.length > 0) {
    const finished = pipelineStatus.steps.filter(
      (s) => s.status === "COMPLETE" || s.status === "FAILED"
    ).length;
    const generating = pipelineStatus.steps.some((s) => s.status === "GENERATING") ? 0.5 : 0;
    base = 55 + ((finished + generating) / pipelineStatus.steps.length) * 35;
  }

  return Math.min(99, Math.max(4, Math.round(base)));
}

/** True when job was queued but worker never picked it up. */
export function isQueuedStale(
  status: string,
  pipelineStatus: unknown,
  updatedAt: Date,
  thresholdMs = 120_000
): boolean {
  if (status !== "QUEUED") return false;
  if (pipelineStatus != null && typeof pipelineStatus === "object") return false;
  return Date.now() - updatedAt.getTime() > thresholdMs;
}

export function formatElapsed(isoStart: string | undefined): string {
  if (!isoStart) return "";
  const sec = Math.floor((Date.now() - new Date(isoStart).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}
