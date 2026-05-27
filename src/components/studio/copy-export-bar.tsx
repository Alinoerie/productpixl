"use client";

import Link from "next/link";
import { Copy, Download, FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import {
  formatListingCsv,
  formatListingPlain,
  listingExportFilename,
  type ListingExportPayload,
} from "@/lib/export-listing";
import { type MarketplaceId } from "@/lib/marketplaces";
import { cn } from "@/lib/utils";

export function CopyExportBar({
  marketplaceId,
  productName,
  productId,
  listingCopy,
  saving,
  onSave,
  className,
}: {
  marketplaceId: MarketplaceId;
  productName: string;
  productId: string | null;
  listingCopy: ListingExportPayload;
  saving?: boolean;
  onSave?: () => void;
  className?: string;
}) {
  const { toast } = useToast();
  const slug = productName.replace(/\s+/g, "-").toLowerCase() || "listing";

  async function copyAll() {
    await navigator.clipboard.writeText(formatListingPlain(listingCopy, marketplaceId));
    toast("Listing copied to clipboard");
  }

  function downloadTxt() {
    const blob = new Blob([formatListingPlain(listingCopy, marketplaceId)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = listingExportFilename(slug, marketplaceId, "txt");
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded listing .txt");
  }

  function downloadCsv() {
    const blob = new Blob([formatListingCsv(listingCopy, marketplaceId)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = listingExportFilename(slug, marketplaceId, "csv");
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded listing .csv");
  }

  return (
    <div
      className={cn(
        "sticky bottom-[var(--mobile-nav-offset)] z-20 flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-md md:static md:rounded-2xl md:border md:backdrop-blur-none",
        className
      )}
    >
      <p className="mr-auto text-sm font-medium">Export listing</p>
      <Button type="button" variant="outline" size="sm" onClick={() => void copyAll()}>
        <Copy className="h-4 w-4" />
        Copy all
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={downloadTxt}>
        <FileText className="h-4 w-4" />
        .txt
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={downloadCsv}>
        <Download className="h-4 w-4" />
        .csv
      </Button>
      {onSave ? (
        <Button type="button" size="sm" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save project
        </Button>
      ) : null}
      {productId ? (
        <Button asChild type="button" variant="ghost" size="sm">
          <Link href={`/products/${productId}#export`}>Full export hub →</Link>
        </Button>
      ) : null}
    </div>
  );
}
