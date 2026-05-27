"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/fetch-json";
import { useToast } from "@/components/ui/toast-provider";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { Loader2 } from "lucide-react";

export function PlaybookRerunButton({
  playbookSlug,
  brandId,
  productIds,
  name,
}: {
  playbookSlug: string;
  brandId: string;
  productIds: string[];
  name: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!productIds.length) return null;

  return (
    <Button
      type="button"
      size="sm"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const { ok, data } = await fetchJson<{ runId?: string; error?: string }>("/api/playbooks/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playbookSlug, brandId, productIds, name }),
          });
          if (!ok) throw new Error(data.error || "Re-run failed");
          toast("Playbook batch queued");
          router.push(`${STUDIO_ROUTES.myPlaybooks}?started=${data.runId}`);
        } catch (e) {
          toast(e instanceof Error ? e.message : "Re-run failed", "error");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-run batch"}
    </Button>
  );
}
