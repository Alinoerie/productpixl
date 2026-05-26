"use client";

import { useEffect, useState } from "react";
import { formatPipelinePhase } from "@/lib/status-labels";
import { Loader2 } from "lucide-react";

export function ProductLiveStatus({ productId }: { productId: string }) {
  const [phase, setPhase] = useState("…");

  useEffect(() => {
    const poll = async () => {
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (res.ok) {
        const ps = data.pipelineStatus as { phase?: string } | null;
        setPhase(ps?.phase ?? data.status);
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [productId]);

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
