"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

export function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteProject = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast("Project deleted");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete project", "error");
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
        <p className="text-sm text-[var(--error)]">
          Delete <strong>{productName}</strong>? This cannot be undone.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={deleting}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
        <Button type="button" size="sm" variant="destructive" disabled={deleting} onClick={deleteProject}>
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
            </>
          ) : (
            "Delete project"
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" className="text-[var(--muted-fg)]" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4" />
      Delete project
    </Button>
  );
}
