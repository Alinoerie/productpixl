"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { GradeListingButton } from "@/components/products/grade-listing-button";

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
  const completedImages = assets.filter((a) => a.imageUrl);

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

  const downloadImages = async () => {
    setDownloading(true);
    try {
      let saved = 0;
      for (const [index, asset] of completedImages.entries()) {
        if (!asset.imageUrl) continue;
        const res = await fetch(asset.imageUrl);
        if (!res.ok) throw new Error("Fetch failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${asset.moduleId}-${index + 1}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        saved++;
      }
      toast(`Saved ${saved} image${saved === 1 ? "" : "s"}`);
    } catch {
      toast("Download failed — open images individually or try again", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--muted)]/30" id="export">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm font-medium">Export & review</p>
        <div className="flex flex-wrap gap-2">
          {completedImages.length > 0 && (
            <Button type="button" variant="outline" size="sm" disabled={downloading} onClick={downloadImages}>
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download images ({completedImages.length})
                </>
              )}
            </Button>
          )}
          {listingCopy?.title ? (
            <Button type="button" variant="outline" size="sm" onClick={copyAllListing}>
              {copied === "listing" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "listing" ? "Copied" : "Copy listing text"}
            </Button>
          ) : completedImages.length > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/copy?productId=${productId}`}>Generate copy</Link>
            </Button>
          ) : null}
          {listingCopy?.title ? (
            <GradeListingButton
              listingCopy={{
                title: listingCopy.title,
                bullets: listingCopy.bullets ?? [],
                description: listingCopy.description ?? undefined,
                backendKeywords: listingCopy.backendKeywords ?? undefined,
              }}
              size="sm"
            />
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
