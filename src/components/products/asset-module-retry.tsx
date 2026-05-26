"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";
import { formatModuleLabel } from "@/lib/status-labels";

const RETRY_HINT =
  "Regenerate this module from scratch with improved composition, lighting, and product clarity.";

export function AssetModuleRetry({
  productId,
  assetId,
  moduleId,
}: {
  productId: string;
  assetId: string;
  moduleId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const retry = async () => {
    setLoading(true);
    setError("");
    try {
      const { ok, status, data } = await fetchJson<{ error?: string }>(
        `/api/products/${productId}/assets/${assetId}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hint: RETRY_HINT, moduleId }),
        }
      );
      if (status === 402) throw new Error("INSUFFICIENT_CREDITS");
      if (!ok) throw new Error(data.error || "Retry failed");
      window.dispatchEvent(new Event("credits-updated"));
      router.refresh();
      toast(`${formatModuleLabel(moduleId)} regenerated`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <Button type="button" variant="outline" size="sm" className="w-full" disabled={loading} onClick={retry}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Retrying…
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            Retry {formatModuleLabel(moduleId)} · 1 credit
          </>
        )}
      </Button>
      {error === "INSUFFICIENT_CREDITS" ? (
        <p className="mt-2 text-xs text-[var(--error)]">
          Need 1 credit.{" "}
          <Link href="/pricing" className="font-medium underline">
            Buy credits
          </Link>
        </p>
      ) : error ? (
        <p className="mt-2 text-xs text-[var(--error)]">{error}</p>
      ) : null}
    </div>
  );
}
