import type { ListingCopy } from "@prisma/client";

/** Pick listing copy for a marketplace, falling back to first available row. */
export function pickListingCopy(
  copies: ListingCopy[] | null | undefined,
  marketplace?: string | null
): ListingCopy | null {
  if (!copies?.length) return null;
  if (marketplace) {
    const match = copies.find((c) => c.marketplace === marketplace);
    if (match) return match;
  }
  return copies[0] ?? null;
}

/** Backward-compatible shape for APIs that expose a single listingCopy. */
export function primaryListingCopy(
  copies: ListingCopy[] | null | undefined,
  marketplace?: string | null
): ListingCopy | null {
  return pickListingCopy(copies, marketplace);
}

/** Compound unique key for ListingCopy upsert/update. */
export function listingCopyWhere(productId: string, marketplace: string) {
  return { productId_marketplace: { productId, marketplace } } as const;
}
