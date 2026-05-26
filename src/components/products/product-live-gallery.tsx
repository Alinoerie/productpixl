"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductLiveStatus } from "@/components/products/product-live-status";
import { Loader2 } from "lucide-react";

type GalleryAsset = {
  id: string;
  moduleId: string;
  imageUrl: string | null;
  qaScore?: number | null;
  status: string;
  errorMessage?: string | null;
};

export function ProductLiveGallery({
  productId,
  productName,
  initialAssets,
  initialStatus,
}: {
  productId: string;
  productName: string;
  initialAssets: GalleryAsset[];
  initialStatus: string;
}) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setAssets(initialAssets);
    setStatus(initialStatus);
  }, [initialAssets, initialStatus]);

  useEffect(() => {
    if (status !== "PROCESSING") return;

    let active = true;
    const poll = async () => {
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (!active || !res.ok) return;

      if (Array.isArray(data.assets)) {
        setAssets(
          data.assets.map((a: GalleryAsset) => ({
            id: a.id,
            moduleId: a.moduleId,
            imageUrl: a.imageUrl,
            qaScore: a.qaScore,
            status: a.status,
            errorMessage: a.errorMessage,
          }))
        );
      }
      setStatus(data.status);

      if (data.status === "COMPLETE" || data.status === "FAILED") {
        router.refresh();
      }
    };

    poll();
    const timer = window.setInterval(poll, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [productId, status, router]);

  if (assets.length === 0 && status === "PROCESSING") {
    return (
      <div className="space-y-4">
        <ProductLiveStatus productId={productId} />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="mt-4 font-medium">Building your gallery…</p>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            Images appear here as each module completes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === "PROCESSING" ? <ProductLiveStatus productId={productId} /> : null}
      <ProductImageGallery productId={productId} productName={productName} assets={assets} />
    </div>
  );
}
