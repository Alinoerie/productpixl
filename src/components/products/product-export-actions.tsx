"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Download } from "lucide-react";

type CopyPayload = {
  title?: string | null;
  bullets?: string[] | null;
  description?: string | null;
  backendKeywords?: string | null;
};

export function ProductExportActions({
  productName,
  assets,
  listingCopy,
}: {
  productName: string;
  assets: { moduleId: string; imageUrl: string | null }[];
  listingCopy: CopyPayload | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const completedImages = assets.filter((a) => a.imageUrl);

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
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

  const downloadImages = () => {
    completedImages.forEach((asset, index) => {
      if (!asset.imageUrl) return;
      const a = document.createElement("a");
      a.href = asset.imageUrl;
      a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${asset.moduleId}-${index + 1}.jpg`;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
    });
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--muted)]/30">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm font-medium">Export & review</p>
        <div className="flex flex-wrap gap-2">
          {completedImages.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={downloadImages}>
              <Download className="h-4 w-4" />
              Download images ({completedImages.length})
            </Button>
          )}
          {listingCopy?.title && (
            <Button type="button" variant="outline" size="sm" onClick={copyAllListing}>
              {copied === "listing" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "listing" ? "Copied" : "Copy listing text"}
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/grader">Grade listing copy</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
