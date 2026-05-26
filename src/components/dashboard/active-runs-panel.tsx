"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ActiveRun = {
  id: string;
  name: string;
  status: string;
};

export function ActiveRunsPanel({
  initialRuns,
  totalProjects,
  failedCount,
}: {
  initialRuns: ActiveRun[];
  totalProjects: number;
  failedCount: number;
}) {
  const router = useRouter();
  const [runs, setRuns] = useState(initialRuns);
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
            const data = await res.json();
            if (!res.ok) return run;
            return { ...run, status: data.status as string };
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
      <ul className="mt-3 space-y-2">
        {runs.map((run) => (
          <li key={run.id}>
            <Link
              href={`/products/${run.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm transition-colors hover:border-[var(--accent)]/40"
            >
              <span className="truncate font-medium">{run.name}</span>
              <span
                className={
                  run.status === "FAILED"
                    ? "shrink-0 text-[var(--error)]"
                    : "shrink-0 text-[var(--accent)]"
                }
              >
                {run.status === "FAILED"
                  ? "Failed · Retry"
                  : run.status === "QUEUED"
                    ? "Starting…"
                    : run.status === "PROCESSING"
                      ? "Processing…"
                      : "Complete"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {totalProjects > runs.length ? (
        <Link
          href={failedOnlyPanel ? "/projects?status=FAILED" : "/projects"}
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
