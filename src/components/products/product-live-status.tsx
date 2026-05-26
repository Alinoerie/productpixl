"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PipelineProgressBar } from "@/components/ui/pipeline-progress-bar";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";

export function ProductLiveStatus({
  productId,
  initialStatus = "PROCESSING",
}: {
  productId: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusShape | null>(null);
  const [queuedStale, setQueuedStale] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    let active = true;
    const poll = async () => {
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (!active || !res.ok) return;

      setStatus(data.status as string);
      setPipelineStatus((data.pipelineStatus as PipelineStatusShape | null) ?? null);
      setQueuedStale(Boolean(data.queuedStale));

      if (data.status === "COMPLETE" || data.status === "FAILED") {
        setDone(true);
        router.refresh();
      }
    };

    poll();
    const id = window.setInterval(poll, 2000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [productId, done, router]);

  if (done) return null;

  return (
    <div
      className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)]/40 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <PipelineProgressBar
        status={status}
        pipelineStatus={pipelineStatus}
        queuedStale={queuedStale}
      />
    </div>
  );
}
