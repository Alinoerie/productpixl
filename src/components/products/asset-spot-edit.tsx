"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";

export function AssetSpotEdit({
  productId,
  assetId,
  moduleId,
}: {
  productId: string;
  assetId: string;
  moduleId: string;
}) {
  const router = useRouter();
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!hint.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { ok, data } = await fetchJson<{
        error?: string;
        imageUrl?: string;
      }>(`/api/products/${productId}/assets/${assetId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint, moduleId }),
      });
      if (!ok) throw new Error(data.error || "Regeneration failed");
      router.refresh();
      setHint("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
        Spot edit · 1 credit
      </p>
      <Textarea
        placeholder="e.g. warmer lighting, remove shadow on left, more premium kitchen background…"
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        className="mt-2 min-h-[72px] text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button
        size="sm"
        className="mt-2 w-full"
        onClick={submit}
        disabled={loading || !hint.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        Regenerate this module
      </Button>
    </div>
  );
}
