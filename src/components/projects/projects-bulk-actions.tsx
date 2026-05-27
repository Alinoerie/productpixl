"use client";

import { useState } from "react";
import { Loader2, Trash2, Download, RotateCcw } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import {
  formatListingCsv,
  formatListingPlain,
  exportPackReadme,
} from "@/lib/export-listing";
import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";
import { useRouter } from "next/navigation";

export function ProjectsBulkActions({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  async function runAction(action: "delete" | "export-meta" | "rerun-playbook") {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/projects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
          playbookSlug: action === "rerun-playbook" ? "amazon-main-images" : undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        deleted?: number;
        exports?: Array<{
          id: string;
          name: string;
          marketplace: string;
          listingCopy: {
            title: string;
            bullets: unknown;
            description?: string | null;
            backendKeywords?: string | null;
          } | null;
          assets: { moduleId: string; imageUrl: string | null }[];
        }>;
        queued?: number;
      };

      if (!res.ok) {
        setMessage(data.error ?? "Bulk action failed");
        return;
      }

      if (action === "delete") {
        setMessage(`Deleted ${data.deleted ?? 0} projects`);
        onClear();
        router.refresh();
        return;
      }

      if (action === "rerun-playbook") {
        setMessage(`Queued ${data.queued ?? 0} playbook reruns`);
        onClear();
        router.refresh();
        return;
      }

      if (action === "export-meta" && data.exports) {
        const zip = new JSZip();
        for (const item of data.exports) {
          const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
          const folder = zip.folder(slug) ?? zip;
          const marketplaceId = item.marketplace as MarketplaceId;
          folder.file("README.txt", exportPackReadme(marketplaceId, item.name));
          if (item.listingCopy?.title) {
            const payload = {
              title: item.listingCopy.title,
              bullets: (item.listingCopy.bullets as string[]) ?? [],
              description: item.listingCopy.description ?? undefined,
              backendKeywords: item.listingCopy.backendKeywords ?? undefined,
            };
            folder.file("listing.txt", formatListingPlain(payload, marketplaceId));
            folder.file("listing.csv", formatListingCsv(payload, marketplaceId));
          }
          const images = folder.folder("images");
          for (const [index, asset] of item.assets.entries()) {
            if (!asset.imageUrl) continue;
            try {
              const imageRes = await fetch(asset.imageUrl);
              const blob = await imageRes.blob();
              images?.file(`${asset.moduleId}-${index + 1}.jpg`, blob);
            } catch {
              /* skip failed image fetch */
            }
          }
          folder.file(
            "meta.json",
            JSON.stringify(
              {
                marketplace: getMarketplace(marketplaceId).label,
                imageCount: item.assets.length,
              },
              null,
              2
            )
          );
        }
        const archive = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(archive);
        const a = document.createElement("a");
        a.href = url;
        a.download = `productpixl-bulk-export-${selectedIds.length}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage(`Exported ${data.exports.length} projects`);
        onClear();
      }
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/20 px-4 py-3">
      <p className="text-sm font-medium">
        {selectedIds.length} selected
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={status === "loading"}
        onClick={() => void runAction("export-meta")}
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Export ZIP
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={status === "loading"}
        onClick={() => void runAction("rerun-playbook")}
      >
        <RotateCcw className="h-4 w-4" />
        Re-run playbook
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={status === "loading"}
        onClick={() => void runAction("delete")}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <button type="button" className="text-sm text-[var(--muted-fg)] underline-offset-2 hover:underline" onClick={onClear}>
        Clear
      </button>
      {message ? <span className="text-sm text-[var(--muted-fg)]">{message}</span> : null}
    </div>
  );
}
