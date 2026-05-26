"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X, ZoomIn } from "lucide-react";
import { formatModuleLabel } from "@/lib/status-labels";
import { AssetSpotEdit } from "@/components/products/asset-spot-edit";
import { AssetModuleRetry } from "@/components/products/asset-module-retry";
import { cn } from "@/lib/utils";

type GalleryAsset = {
  id: string;
  moduleId: string;
  imageUrl: string | null;
  qaScore?: number | null;
  status: string;
  errorMessage?: string | null;
};

export function ProductImageGallery({
  productId,
  productName,
  assets,
  readOnly = false,
}: {
  productId: string;
  productName: string;
  assets: GalleryAsset[];
  readOnly?: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [filter, setFilter] = useState<"all" | "complete" | "failed">("all");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const failedCount = assets.filter((a) => a.status === "FAILED").length;
  const completeCount = assets.filter((a) => a.status === "COMPLETE" && a.imageUrl).length;
  const filteredAssets =
    filter === "complete"
      ? assets.filter((a) => a.status === "COMPLETE" && a.imageUrl)
      : filter === "failed"
        ? assets.filter((a) => a.status === "FAILED")
        : assets;

  const viewableAssets = assets.filter((a) => a.imageUrl);
  const lightbox = lightboxIndex != null ? viewableAssets[lightboxIndex] ?? null : null;

  const openLightbox = (asset: GalleryAsset, el: HTMLElement) => {
    const index = viewableAssets.findIndex((a) => a.id === asset.id);
    if (index < 0) return;
    setTriggerEl(el);
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    triggerEl?.focus();
  }, [triggerEl]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i == null || viewableAssets.length === 0) return i;
      return i === 0 ? viewableAssets.length - 1 : i - 1;
    });
  }, [viewableAssets.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i == null || viewableAssets.length === 0) return i;
      return i === viewableAssets.length - 1 ? 0 : i + 1;
    });
  }, [viewableAssets.length]);

  const downloadLightboxImage = useCallback(async () => {
    if (!lightbox?.imageUrl) return;
    try {
      const res = await fetch(lightbox.imageUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${lightbox.moduleId}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(lightbox.imageUrl, "_blank", "noopener,noreferrer");
    }
  }, [lightbox, productName]);

  useEffect(() => {
    if (lightboxIndex == null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
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
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  return (
    <>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl">Gallery images</h2>
          {assets.length > 1 && (failedCount > 0 || completeCount > 0) ? (
            <div className="flex gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-1">
              {(
                [
                  { id: "all" as const, label: `All (${assets.length})` },
                  ...(completeCount > 0
                    ? [{ id: "complete" as const, label: `Ready (${completeCount})` }]
                    : []),
                  ...(failedCount > 0
                    ? [{ id: "failed" as const, label: `Failed (${failedCount})` }]
                    : []),
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilter(chip.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filter === chip.id
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((a) => (
            <article
              key={a.id}
              className={cn(
                "group overflow-hidden rounded-2xl border bg-[var(--card)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
                a.status === "FAILED"
                  ? "border-[var(--error-border)]"
                  : "border-[var(--border)]"
              )}
            >
              <div className="relative aspect-square bg-[var(--muted)]">
                {a.imageUrl ? (
                  <button
                    type="button"
                    className="relative block h-full w-full"
                    onClick={(e) => openLightbox(a, e.currentTarget)}
                    aria-label={`View ${formatModuleLabel(a.moduleId)} full size`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.imageUrl}
                      alt={`${productName} — ${formatModuleLabel(a.moduleId)}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <ZoomIn className="h-4 w-4" />
                    </span>
                  </button>
                ) : a.status === "FAILED" ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <span className="text-sm font-medium text-[var(--error)]">Generation failed</span>
                    <span className="text-xs text-[var(--muted-fg)]">Retry below or spot-edit after success</span>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted-fg)]">
                    <span className="animate-pulse-soft">Generating…</span>
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2 py-0.5 font-serif text-xs text-white">
                  {a.moduleId}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium">
                  {formatModuleLabel(a.moduleId)}
                  {a.qaScore != null ? ` · QA ${a.qaScore}/10` : ""}
                </p>
                {a.errorMessage ? (
                  <p className="mt-2 text-xs text-[var(--error)]">{a.errorMessage}</p>
                ) : null}
                {a.status === "COMPLETE" && a.imageUrl && !readOnly ? (
                  <AssetSpotEdit productId={productId} assetId={a.id} moduleId={a.moduleId} />
                ) : null}
                {a.status === "FAILED" && !readOnly ? (
                  <AssetModuleRetry productId={productId} assetId={a.id} moduleId={a.moduleId} />
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {filteredAssets.length === 0 ? (
          <p className="mt-4 text-center text-sm text-[var(--muted-fg)]">
            No {filter === "failed" ? "failed" : filter === "complete" ? "completed" : ""} modules in this view.
          </p>
        ) : null}
      </section>

      {lightbox?.imageUrl ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${formatModuleLabel(lightbox.moduleId)} preview`}
          onClick={closeLightbox}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={closeLightbox}
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          {viewableAssets.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-16"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt={`${productName} — ${formatModuleLabel(lightbox.moduleId)}`}
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <p className="text-center text-sm text-white/80">
                {formatModuleLabel(lightbox.moduleId)}
                {lightbox.qaScore != null ? ` · QA ${lightbox.qaScore}/10` : ""}
                {viewableAssets.length > 1 ? (
                  <> · {lightboxIndex! + 1} of {viewableAssets.length}</>
                ) : null}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                onClick={() => void downloadLightboxImage()}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
