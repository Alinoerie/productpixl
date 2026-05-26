"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Download, ImageIcon, Loader2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { downloadGalleryZip } from "@/lib/download-gallery-zip";

type CopyPayload = {
  title?: string | null;
  bullets?: string[] | null;
  description?: string | null;
  backendKeywords?: string | null;
};

export function ProductExportActions({
  productId,
  productName,
  assets,
  listingCopy,
}: {
  productId: string;
  productName: string;
  assets: { moduleId: string; imageUrl: string | null }[];
  listingCopy: CopyPayload | null;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const completedImages = assets.filter((a): a is { moduleId: string; imageUrl: string } => Boolean(a.imageUrl));
  const hasCopy = Boolean(listingCopy?.title);
  const hasImages = completedImages.length > 0;
  const exportReady = hasCopy && hasImages;
  const slug = productName.replace(/\s+/g, "-").toLowerCase() || "product";

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllListing = async () => {
    if (!listingCopy?.title) return;
    const bullets = (listingCopy.bullets ?? []).map((b, i) => `${i + 1}. ${b}`).join("\n");
    const text = [
      listingCopy.title,
      "",
      bullets,
      "",
      listingCopy.description ?? "",
      "",
      `Keywords: ${listingCopy.backendKeywords ?? ""}`,
    ].join("\n");
    await copyText("listing", text);
  };

  const exportListingJson = () => {
    if (!listingCopy?.title) return;
    const blob = new Blob([JSON.stringify(listingCopy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-listing.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Listing JSON downloaded");
  };

  const downloadImages = async () => {
    if (completedImages.length === 0) return;
    setDownloading(true);
    setDownloadProgress(null);
    try {
      const saved = await downloadGalleryZip(completedImages, slug, (saved, total) => {
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

  if (!hasCopy && !hasImages) {
    return (
      <Card className="scroll-mt-24 border-dashed" id="export">
        <CardContent className="py-8 text-center">
          <p className="font-serif text-lg">Nothing to export yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted-fg)]">
            Generate gallery images or listing copy first — export tools appear here when your project is ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={`/generate?productId=${productId}`}>
                <ImageIcon className="h-4 w-4" />
                Run image studio
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/copy?productId=${productId}`}>
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
                ? "Gallery and listing copy are ready — download or copy below."
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
          <div className="flex flex-wrap gap-2">
            {hasImages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/copy?productId=${productId}`}>Generate copy</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={`/generate?productId=${productId}`}>Run image studio</Link>
              </Button>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {hasImages ? (
            <Button type="button" variant="outline" size="sm" disabled={downloading} onClick={downloadImages}>
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
          ) : null}
          {hasCopy ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={copyAllListing}>
                {copied === "listing" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === "listing" ? "Copied" : "Copy listing text"}
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
