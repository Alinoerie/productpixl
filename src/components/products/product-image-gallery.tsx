"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { formatModuleLabel } from "@/lib/status-labels";
import { AssetSpotEdit } from "@/components/products/asset-spot-edit";

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
}: {
  productId: string;
  productName: string;
  assets: GalleryAsset[];
}) {
  const [lightbox, setLightbox] = useState<GalleryAsset | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openLightbox = (asset: GalleryAsset, el: HTMLElement) => {
    setTriggerEl(el);
    setLightbox(asset);
  };

  const closeLightbox = () => {
    setLightbox(null);
    triggerEl?.focus();
  };

  useEffect(() => {
    if (!lightbox) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
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
  }, [lightbox, triggerEl]);

  return (
    <>
      <section>
        <h2 className="mb-4 font-serif text-xl">Gallery images</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <article
              key={a.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
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
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-4 w-4" />
                    </span>
                  </button>
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
                {a.status === "COMPLETE" && a.imageUrl ? (
                  <AssetSpotEdit productId={productId} assetId={a.id} moduleId={a.moduleId} />
                ) : null}
              </div>
            </article>
          ))}
        </div>
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
          <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt={`${productName} — ${formatModuleLabel(lightbox.moduleId)}`}
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
              tabIndex={0}
            />
            <p className="mt-3 text-center text-sm text-white/80">
              {formatModuleLabel(lightbox.moduleId)}
              {lightbox.qaScore != null ? ` · QA ${lightbox.qaScore}/10` : ""}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
