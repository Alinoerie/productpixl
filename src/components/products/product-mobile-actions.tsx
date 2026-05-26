"use client";

import Link from "next/link";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { Button } from "@/components/ui/button";

export function ProductMobileActions({
  productId,
  hasImages,
  hasCopy,
  status,
  listingCopy,
}: {
  productId: string;
  hasImages: boolean;
  hasCopy: boolean;
  status: string;
  listingCopy: {
    title: string;
    bullets: string[];
    description?: string | null;
    backendKeywords?: string | null;
  } | null;
}) {
  const showBar =
    status === "FAILED" ||
    (hasImages && !hasCopy) ||
    hasCopy ||
    !hasImages;

  if (!showBar) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        {status === "FAILED" ? (
          <Button asChild className="flex-1">
            <Link href={`/generate?productId=${productId}`}>Retry run</Link>
          </Button>
        ) : hasImages && !hasCopy ? (
          <Button asChild className="flex-1">
            <Link href={`/copy?productId=${productId}`}>Generate copy</Link>
          </Button>
        ) : hasCopy && listingCopy ? (
          <>
            <GradeListingButton
              listingCopy={{
                title: listingCopy.title,
                bullets: listingCopy.bullets,
                description: listingCopy.description ?? undefined,
                backendKeywords: listingCopy.backendKeywords ?? undefined,
                productId,
              }}
              className="flex-1"
            />
            {hasImages ? (
              <Button asChild variant="outline" className="shrink-0">
                <Link href="#export">Export</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/generate?productId=${productId}`}>Add images</Link>
              </Button>
            )}
          </>
        ) : !hasImages ? (
          <Button asChild className="flex-1">
            <Link href={`/generate?productId=${productId}`}>Run image studio</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
