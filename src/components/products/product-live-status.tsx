"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPipelinePhase } from "@/lib/status-labels";
import { Loader2 } from "lucide-react";

export function ProductLiveStatus({ productId }: { productId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState("…");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    let active = true;
    const poll = async () => {
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (!active || !res.ok) return;

      const ps = data.pipelineStatus as { phase?: string } | null;
      setPhase(ps?.phase ?? data.status);

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
      className="flex items-center gap-3 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)]/40 px-4 py-3 text-sm"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
      <span>
        Generating your gallery — <strong>{formatPipelinePhase(phase)}</strong>
      </span>
    </div>
  );
}
