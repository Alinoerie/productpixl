"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PipelineProgressBar } from "@/components/ui/pipeline-progress-bar";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";
import { ResetStuckRunButton } from "@/components/products/reset-stuck-run-button";
import { STUDIO_ROUTES, studioImagesHref } from "@/lib/studio-routes";

type ActiveRun = {
  id: string;
  name: string;
  status: string;
  pipelineStatus?: PipelineStatusShape | null;
  queuedStale?: boolean;
  progress?: number;
};

type StatusPayload = {
  status: string;
  pipelineStatus?: PipelineStatusShape | null;
  queuedStale?: boolean;
  progress?: number;
};

export function ActiveRunsPanel({
  initialRuns,
  totalProjects,
  failedCount,
}: {
  initialRuns: Omit<ActiveRun, "pipelineStatus" | "queuedStale" | "progress">[];
  totalProjects: number;
  failedCount: number;
}) {
  const router = useRouter();
  const [runs, setRuns] = useState<ActiveRun[]>(initialRuns);
  const runsRef = useRef(runs);

  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  useEffect(() => {
    runsRef.current = runs;
  }, [runs]);

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      const current = runsRef.current;
      const active = current.filter((run) => run.status === "QUEUED" || run.status === "PROCESSING");
      if (active.length === 0) return;

      const updated = await Promise.all(
        current.map(async (run) => {
          if (run.status !== "QUEUED" && run.status !== "PROCESSING") return run;
          try {
            const res = await fetch(`/api/products/${run.id}/status`);
            const data = (await res.json()) as StatusPayload;
            if (!res.ok) return run;
            return {
              ...run,
              status: data.status,
              pipelineStatus: data.pipelineStatus ?? null,
              queuedStale: data.queuedStale,
              progress: data.progress,
            };
          } catch {
            return run;
          }
        })
      );

      if (!alive) return;
      const nextRuns = updated.filter((run) => run.status !== "COMPLETE");
      setRuns(nextRuns);

      const stillActive = nextRuns.some((run) => run.status === "QUEUED" || run.status === "PROCESSING");
      if (!stillActive && active.length > 0) router.refresh();
    };

    poll();
    const timer = window.setInterval(poll, 2500);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [router]);

  if (runs.length === 0) return null;

  const inProgressCount = runs.filter((run) => run.status === "PROCESSING" || run.status === "QUEUED").length;
  const failedOnlyPanel = runs.every((run) => run.status === "FAILED");

  return (
    <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/25 px-4 py-4">
      <p className="text-sm font-semibold">
        {inProgressCount > 0
          ? `${inProgressCount} run${inProgressCount === 1 ? "" : "s"} in progress`
          : "Needs attention"}
      </p>
      <ul className="mt-3 space-y-3">
        {runs.map((run) => (
          <li
            key={run.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/products/${run.id}`}
                className="min-w-0 flex-1 transition-colors hover:text-[var(--accent)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">{run.name}</span>
                  {run.status === "FAILED" ? (
                    <span className="shrink-0 text-[var(--error)]">Failed</span>
                  ) : null}
                </div>
                {run.status === "QUEUED" || run.status === "PROCESSING" ? (
                  <PipelineProgressBar
                    className="mt-2"
                    compact
                    status={run.status}
                    pipelineStatus={run.pipelineStatus}
                    queuedStale={run.queuedStale}
                  />
                ) : run.status === "FAILED" ? (
                  <span className="mt-1 block text-xs text-[var(--muted-fg)]">
                    Retry in Images →
                  </span>
                ) : null}
              </Link>
              {run.status === "QUEUED" || run.status === "PROCESSING" ? (
                <ResetStuckRunButton
                  productId={run.id}
                  label={run.queuedStale ? "Reset stuck" : "Reset"}
                  variant="outline"
                  size="sm"
                  onReset={() => {
                    setRuns((current) =>
                      current.map((item) =>
                        item.id === run.id
                          ? { ...item, status: "FAILED", queuedStale: false, progress: 0 }
                          : item
                      )
                    );
                    router.refresh();
                  }}
                />
              ) : run.status === "FAILED" ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={studioImagesHref({ productId: run.id })}>Retry</Link>
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {totalProjects > runs.length ? (
        <Link
          href={failedOnlyPanel ? "/projects?status=FAILED" : STUDIO_ROUTES.projects}
          className="mt-3 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          {failedOnlyPanel ? "View all failed projects →" : "View all projects →"}
        </Link>
      ) : failedCount > 0 ? (
        <Link
          href="/projects?status=FAILED"
          className="mt-3 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          View all failed projects →
        </Link>
      ) : null}
    </div>
  );
}
