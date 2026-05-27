"use client";

import { useState } from "react";
import Link from "next/link";
import { studioCopyHref, studioImagesHref } from "@/lib/studio-routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle, Copy, Download, ImageIcon, Loader2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { downloadExportPack as buildExportPack, downloadGalleryZip, type ImageExportFormat } from "@/lib/download-export-pack";
import {
  formatListingCsv,
  formatListingPlain,
  listingExportFilename,
  type ListingExportPayload,
} from "@/lib/export-listing";
import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";

type CopyPayload = {
  title?: string | null;
  bullets?: string[] | null;
  description?: string | null;
  backendKeywords?: string | null;
};

export function ProductExportActions({
  productId,
  productName,
  marketplaceId,
  assets,
  listingCopy,
}: {
  productId: string;
  productName: string;
  marketplaceId: MarketplaceId;
  assets: { moduleId: string; imageUrl: string | null }[];
  listingCopy: CopyPayload | null;
}) {
  const { toast } = useToast();
  const marketplace = getMarketplace(marketplaceId);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [packDownloading, setPackDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<ImageExportFormat>("jpg");
  const completedImages = assets.filter((a): a is { moduleId: string; imageUrl: string } => Boolean(a.imageUrl));
  const hasCopy = Boolean(listingCopy?.title);
  const hasImages = completedImages.length > 0;
  const exportReady = hasCopy && hasImages;
  const slug = productName.replace(/\s+/g, "-").toLowerCase() || "product";
  const listingTxtLabel =
    marketplaceId === "BOL_NL"
      ? "Bol.com .txt"
      : marketplaceId === "SHOPIFY"
        ? "Shopify .txt"
        : "Download .txt";
  const listingCsvLabel =
    marketplaceId === "BOL_NL"
      ? "Bol.com CSV"
      : marketplaceId === "SHOPIFY"
        ? "Shopify CSV"
        : "Download .csv";
  const exportPackLabel =
    marketplaceId === "BOL_NL"
      ? "Bol.com export pack"
      : marketplaceId === "SHOPIFY"
        ? "Shopify export pack"
        : `${marketplace.label} export pack`;

  const checklist = (
    <ul className="mt-4 space-y-2 text-sm">
      <li className="flex items-center gap-2">
        {hasImages ? (
          <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2.5} />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-[var(--muted-fg)]" strokeWidth={1.5} />
        )}
        <span className={hasImages ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]"}>
          {hasImages
            ? `${completedImages.length} gallery image${completedImages.length === 1 ? "" : "s"}`
            : "Gallery images"}
        </span>
      </li>
      <li className="flex items-center gap-2">
        {hasCopy ? (
          <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2.5} />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-[var(--muted-fg)]" strokeWidth={1.5} />
        )}
        <span className={hasCopy ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]"}>
          Listing copy
        </span>
      </li>
    </ul>
  );

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllListing = async () => {
    if (!listingCopy?.title) return;
    const payload: ListingExportPayload = {
      title: listingCopy.title,
      bullets: listingCopy.bullets ?? [],
      description: listingCopy.description,
      backendKeywords: listingCopy.backendKeywords,
    };
    await copyText("listing", formatListingPlain(payload, marketplaceId));
  };

  const exportListingJson = () => {
    if (!listingCopy?.title) return;
    const blob = new Blob(
      [JSON.stringify({ ...listingCopy, marketplace: marketplaceId }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = listingExportFilename(slug, marketplaceId, "json");
    a.click();
    URL.revokeObjectURL(url);
    toast("Listing JSON downloaded");
  };

  const exportListingCsv = () => {
    if (!listingCopy?.title) return;
    const payload: ListingExportPayload = {
      title: listingCopy.title,
      bullets: listingCopy.bullets ?? [],
      description: listingCopy.description,
      backendKeywords: listingCopy.backendKeywords,
    };
    const blob = new Blob([formatListingCsv(payload, marketplaceId)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = listingExportFilename(slug, marketplaceId, "csv");
    a.click();
    URL.revokeObjectURL(url);
    toast(`${marketplace.label} CSV downloaded`);
  };

  const exportListingTxt = () => {
    if (!listingCopy?.title) return;
    const payload: ListingExportPayload = {
      title: listingCopy.title,
      bullets: listingCopy.bullets ?? [],
      description: listingCopy.description,
      backendKeywords: listingCopy.backendKeywords,
    };
    const blob = new Blob([formatListingPlain(payload, marketplaceId)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = listingExportFilename(slug, marketplaceId, "txt");
    a.click();
    URL.revokeObjectURL(url);
    toast(`${marketplace.label} listing downloaded`);
  };

  const downloadImages = async () => {
    if (completedImages.length === 0) return;
    setDownloading(true);
    setDownloadProgress(null);
    try {
      const saved = await downloadGalleryZip(completedImages, slug, imageFormat, (saved, total) => {
        setDownloadProgress(`${saved}/${total}`);
      });
      toast(`Downloaded ${slug}-gallery.zip (${saved} image${saved === 1 ? "" : "s"})`);
    } catch {
      toast("Download failed — open images individually or try again", "error");
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
    }
  };

  const downloadFullExportPack = async () => {
    if (!listingCopy?.title || completedImages.length === 0) return;
    setPackDownloading(true);
    setDownloadProgress(null);
    try {
      const payload: ListingExportPayload = {
        title: listingCopy.title,
        bullets: listingCopy.bullets ?? [],
        description: listingCopy.description,
        backendKeywords: listingCopy.backendKeywords,
      };
      const { imageCount } = await buildExportPack(
        {
          slug,
          productName,
          marketplaceId,
          assets: completedImages,
          listingCopy: payload,
          imageFormat,
        },
        (phase) => setDownloadProgress(phase)
      );
      toast(`Downloaded ${exportPackLabel} (${imageCount} images + listing files)`);
    } catch {
      toast("Export pack failed — try individual downloads below", "error");
    } finally {
      setPackDownloading(false);
      setDownloadProgress(null);
    }
  };

  if (!hasCopy && !hasImages) {
    return (
      <Card className="scroll-mt-24 border-dashed" id="export">
        <CardContent className="py-8 text-center">
          <p className="font-serif text-lg">Nothing to export yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted-fg)]">
            Complete both steps below — export tools unlock when gallery images and listing copy are ready.
          </p>
          <div className="mx-auto max-w-xs text-left">{checklist}</div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={studioImagesHref({ productId })}>
                <ImageIcon className="h-4 w-4" />
                Run image studio
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={studioCopyHref(productId)}>
                <FileText className="h-4 w-4" />
                Generate copy
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`scroll-mt-24 border-[var(--border)] ${exportReady ? "bg-[var(--success-bg)]/20" : "bg-[var(--muted)]/30"}`}
      id="export"
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Export & review</p>
            <p className="mt-1 text-xs text-[var(--muted-fg)]">
              {exportReady
                ? `${marketplace.flag} ${marketplace.label} — gallery and copy ready to export.`
                : hasImages
                  ? "Images ready — add listing copy to finish export."
                  : "Copy ready — add gallery images to finish export."}
            </p>
          </div>
          {exportReady ? (
            <span className="rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
              Export-ready
            </span>
          ) : null}
        </div>

        {!exportReady ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            {checklist}
            <div className="mt-4 flex flex-wrap gap-2">
              {hasImages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={studioCopyHref(productId)}>Generate copy</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={studioImagesHref({ productId })}>Run image studio</Link>
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {exportReady ? (
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={packDownloading || downloading}
            onClick={() => void downloadFullExportPack()}
          >
            {packDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {downloadProgress ?? "Packing export…"}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {exportPackLabel}
              </>
            )}
          </Button>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {hasImages ? (
            <>
              <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-1">
                {(["jpg", "png", "webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setImageFormat(fmt)}
                    aria-pressed={imageFormat === fmt}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      imageFormat === fmt
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                    }`}
                    title={
                      fmt === "png" ? "PNG (transparent)" : fmt === "jpg" ? "JPG (compressed)" : "WebP (modern)"
                    }
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={downloading || packDownloading}
                onClick={downloadImages}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {downloadProgress ? `Packing ${downloadProgress}…` : "Packing ZIP…"}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download gallery.zip ({completedImages.length})
                  </>
                )}
              </Button>
            </>
          ) : null}
          {hasCopy ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={copyAllListing}>
                {copied === "listing" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === "listing" ? "Copied" : `Copy for ${marketplace.label}`}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportListingTxt}>
                <Download className="h-4 w-4" />
                {listingTxtLabel}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportListingCsv}>
                <Download className="h-4 w-4" />
                {listingCsvLabel}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportListingJson}>
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
              <GradeListingButton
                productId={productId}
                listingCopy={{
                  title: listingCopy!.title!,
                  bullets: listingCopy!.bullets ?? [],
                  description: listingCopy!.description ?? undefined,
                  backendKeywords: listingCopy!.backendKeywords ?? undefined,
                  productId,
                }}
                size="sm"
              />
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/grader">Grade listing copy</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
