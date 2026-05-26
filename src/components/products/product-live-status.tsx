"use client";

import { useEffect, useState } from "react";

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
    <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm">
      Live status: <strong>{phase}</strong>
    </p>
  );
}
