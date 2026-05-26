"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetch-json";
import { formatModuleLabel } from "@/lib/status-labels";

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
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!hint.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { ok, status, data } = await fetchJson<{
        error?: string;
        imageUrl?: string;
      }>(`/api/products/${productId}/assets/${assetId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint, moduleId }),
      });
      if (status === 402) throw new Error("INSUFFICIENT_CREDITS");
      if (!ok) throw new Error(data.error || "Regeneration failed");
      window.dispatchEvent(new Event("credits-updated"));
      router.refresh();
      setHint("");
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => setOpen(true)}
      >
        <Wand2 className="h-4 w-4" />
        Refine {formatModuleLabel(moduleId)} · 1 credit
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
          Spot edit · 1 credit
        </p>
        <button
          type="button"
          className="text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)]"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Cancel
        </button>
      </div>
      <Label htmlFor={`spot-edit-${assetId}`} className="sr-only">
        Refinement instructions for {formatModuleLabel(moduleId)}
      </Label>
      <Textarea
        id={`spot-edit-${assetId}`}
        placeholder="e.g. warmer lighting, remove shadow on left, more premium kitchen background…"
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        className="mt-2 min-h-[72px] text-sm"
      />
      {error === "INSUFFICIENT_CREDITS" ? (
        <p className="mt-2 text-xs text-red-600">
          Need 1 credit.{" "}
          <Link href="/pricing" className="font-medium underline">
            Buy credits
          </Link>
        </p>
      ) : error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
      <Button
        size="sm"
        className="mt-2 w-full"
        onClick={submit}
        disabled={loading || !hint.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Regenerating…
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" /> Run spot edit
          </>
        )}
      </Button>
    </div>
  );
}
