import JSZip from "jszip";
import {
  formatListingCsv,
  formatListingPlain,
  exportPackReadme,
  type ListingExportPayload,
} from "@/lib/export-listing";
import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";

type GalleryAsset = {
  moduleId: string;
  imageUrl: string;
};

export function exportPackFilename(slug: string, marketplaceId: MarketplaceId) {
  const mp = getMarketplace(marketplaceId);
  const market = mp.label.replace(/\s+/g, "-").toLowerCase();
  return `${slug}-${market}-export.zip`;
}

async function fetchImageBlob(imageUrl: string): Promise<{ blob: Blob; ext: "png" | "jpg" }> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Fetch failed");
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  return { blob, ext };
}

/** Gallery images + listing files in one marketplace-ready ZIP. */
export async function downloadExportPack(
  params: {
    slug: string;
    productName: string;
    marketplaceId: MarketplaceId;
    assets: GalleryAsset[];
    listingCopy: ListingExportPayload;
  },
  onProgress?: (phase: string) => void
): Promise<{ imageCount: number }> {
  const { slug, productName, marketplaceId, assets, listingCopy } = params;
  const mp = getMarketplace(marketplaceId);
  const zip = new JSZip();
  const root = zip.folder(`${slug}-${mp.label.replace(/\s+/g, "-").toLowerCase()}-export`) ?? zip;

  root.file("README.txt", exportPackReadme(marketplaceId, productName));

  const listingFolder = root.folder("listing") ?? root;
  listingFolder.file("listing.txt", formatListingPlain(listingCopy, marketplaceId));
  listingFolder.file("listing.csv", formatListingCsv(listingCopy, marketplaceId));
  listingFolder.file(
    "listing.json",
    JSON.stringify({ ...listingCopy, marketplace: marketplaceId }, null, 2)
  );

  const imagesFolder = root.folder("images") ?? root;
  let imageCount = 0;

  for (const [index, asset] of assets.entries()) {
    onProgress?.(`Packing image ${index + 1}/${assets.length}…`);
    const { blob, ext } = await fetchImageBlob(asset.imageUrl);
    imagesFolder.file(`${asset.moduleId}-${index + 1}.${ext}`, blob);
    imageCount++;
  }

  onProgress?.("Creating ZIP…");
  const archive = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(archive);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportPackFilename(slug, marketplaceId);
  a.click();
  URL.revokeObjectURL(url);

  return { imageCount };
}

export async function downloadGalleryZip(
  assets: GalleryAsset[],
  slug: string,
  onProgress?: (saved: number, total: number) => void
): Promise<number> {
  const zip = new JSZip();
  const folder = zip.folder(slug) ?? zip;
  let saved = 0;

  for (const [index, asset] of assets.entries()) {
    const { blob, ext } = await fetchImageBlob(asset.imageUrl);
    folder.file(`${asset.moduleId}-${index + 1}.${ext}`, blob);
    saved++;
    onProgress?.(saved, assets.length);
  }

  const archive = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(archive);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-gallery.zip`;
  a.click();
  URL.revokeObjectURL(url);
  return saved;
}
