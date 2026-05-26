"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

export function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
    }
  };

  useEffect(() => {
    if (!confirming) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        setConfirming(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [confirming, deleting]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-[var(--muted-fg)]"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete project
      </Button>

      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center"
          onClick={() => {
            if (!deleting) setConfirming(false);
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-desc"
            className="w-full max-w-md rounded-2xl border border-[var(--error-border)] bg-[var(--card)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="delete-project-title" className="font-serif text-xl">
              Delete project?
            </p>
            <p id="delete-project-desc" className="mt-2 text-sm text-[var(--muted-fg)]">
              <strong className="text-[var(--foreground)]">{productName}</strong> and its gallery, copy, and export
              data will be removed permanently.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                ref={cancelRef}
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
          </div>
        </div>
      ) : null}
    </>
  );
}
