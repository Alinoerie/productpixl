"use client";

import Link from "next/link";
import { studioCopyHref, studioImagesHref } from "@/lib/studio-routes";
import { ResetStuckRunButton } from "@/components/products/reset-stuck-run-button";
import { Loader2, Save } from "lucide-react";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { useProductEdit } from "@/components/products/product-edit-context";
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
  const edit = useProductEdit();
  const runInProgress = status === "QUEUED" || status === "PROCESSING";
  const showBar =
    edit?.listingDirty ||
    runInProgress ||
    status === "FAILED" ||
    (hasImages && !hasCopy) ||
    hasCopy ||
    !hasImages;

  if (!showBar) return null;

  if (edit?.listingDirty) {
    return (
      <div className="fixed inset-x-0 bottom-[var(--mobile-nav-offset)] z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={edit.listingSaving}
            onClick={() => void edit.saveListing()}
          >
            {edit.listingSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save copy changes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-[var(--mobile-nav-offset)] z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        {runInProgress ? (
          <>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/products/${productId}`}>View progress</Link>
            </Button>
            <ResetStuckRunButton productId={productId} label="Reset" size="sm" className="shrink-0" />
          </>
        ) : status === "FAILED" ? (
          <Button asChild className="flex-1">
            <Link href={studioImagesHref({ productId })}>Retry run</Link>
          </Button>
        ) : hasImages && !hasCopy ? (
          <Button asChild className="flex-1">
            <Link href={studioCopyHref(productId)}>Generate copy</Link>
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
                <Link href={studioImagesHref({ productId })}>Add images</Link>
              </Button>
            )}
          </>
        ) : !hasImages ? (
          <Button asChild className="flex-1">
            <Link href={studioImagesHref({ productId })}>Run images</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
