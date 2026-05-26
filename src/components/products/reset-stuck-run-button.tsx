"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

export function ResetStuckRunButton({
  productId,
  label = "Reset run",
  onReset,
  ...buttonProps
}: {
  productId: string;
  label?: string;
  onReset?: () => void;
} & Pick<ButtonProps, "variant" | "size" | "className">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reset-run`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not reset run");
      onReset?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button type="button" onClick={onClick} disabled={loading} {...buttonProps}>
        {loading ? "Resetting…" : label}
      </Button>
      {error ? <span className="text-xs text-[var(--error)]">{error}</span> : null}
    </span>
  );
}
