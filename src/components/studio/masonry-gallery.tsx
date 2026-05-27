"use client";

import { useMemo, useState } from "react";
import { Heart, ZoomIn } from "lucide-react";
import { formatModuleLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

type GalleryAsset = {
  id: string;
  moduleId: string;
  imageUrl: string | null;
  qaScore?: number | null;
  status?: string;
};

function favoriteKey(moduleId: string) {
  return `ppxl-gallery-fav-${moduleId}`;
}

export function MasonryGallery({
  assets,
  className,
}: {
  assets: GalleryAsset[];
  className?: string;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const map: Record<string, boolean> = {};
    for (const a of assets) {
      map[a.moduleId] = localStorage.getItem(favoriteKey(a.moduleId)) === "1";
    }
    return map;
  });

  const items = useMemo(
    () => assets.filter((a): a is GalleryAsset & { imageUrl: string } => Boolean(a.imageUrl)),
    [assets]
  );

  function toggleFavorite(moduleId: string) {
    setFavorites((prev) => {
      const next = !prev[moduleId];
      localStorage.setItem(favoriteKey(moduleId), next ? "1" : "0");
      return { ...prev, [moduleId]: next };
    });
  }

  return (
    <>
      <div className={cn("columns-1 gap-4 sm:columns-2 lg:columns-3", className)}>
        {items.map((asset) => (
          <figure
            key={asset.id}
            className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.imageUrl}
                alt={formatModuleLabel(asset.moduleId)}
                className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
              />
              <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100">
                <button
                  type="button"
                  className="rounded-full bg-white/90 p-2 text-[var(--foreground)]"
                  onClick={() => setLightbox(asset.imageUrl)}
                  aria-label={`View ${formatModuleLabel(asset.moduleId)} full size`}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full p-2",
                    favorites[asset.moduleId]
                      ? "bg-[var(--error)] text-white"
                      : "bg-white/90 text-[var(--foreground)]"
                  )}
                  onClick={() => toggleFavorite(asset.moduleId)}
                  aria-label={favorites[asset.moduleId] ? "Unfavorite" : "Favorite"}
                  aria-pressed={favorites[asset.moduleId]}
                >
                  <Heart className={cn("h-4 w-4", favorites[asset.moduleId] && "fill-current")} />
                </button>
              </div>
            </div>
            <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="font-medium">{formatModuleLabel(asset.moduleId)}</span>
              {asset.qaScore != null ? (
                <span className="text-xs text-[var(--muted-fg)]">QA {Math.round(asset.qaScore)}</span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Close preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Gallery preview"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      ) : null}
    </>
  );
}
