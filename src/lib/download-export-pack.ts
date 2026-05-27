import JSZip from "jszip";
import {
  formatListingCsv,
  formatListingPlain,
  exportPackReadme,
  type ListingExportPayload,
} from "@/lib/export-listing";
import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";

export type ImageExportFormat = "png" | "jpg" | "webp";

type GalleryAsset = {
  moduleId: string;
  imageUrl: string;
};

export function exportPackFilename(slug: string, marketplaceId: MarketplaceId) {
  const mp = getMarketplace(marketplaceId);
  const market = mp.label.replace(/\s+/g, "-").toLowerCase();
  return `${slug}-${market}-export.zip`;
}

async function fetchImageBlob(imageUrl: string): Promise<Blob> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Fetch failed");
  return res.blob();
}

/**
 * Convert a blob to a different image format using canvas.
 * Falls back to original blob if conversion fails.
 */
async function convertImageBlob(
  blob: Blob,
  format: ImageExportFormat,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "png") {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b ?? blob), "image/png");
      } else if (format === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b ?? blob), "image/jpeg", quality);
      } else {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b ?? blob), "image/webp", quality);
      }
    };
    img.onerror = () => resolve(blob);
    img.src = URL.createObjectURL(blob);
  });
}

async function fetchAndConvertImage(
  imageUrl: string,
  format: ImageExportFormat
): Promise<Blob> {
  const blob = await fetchImageBlob(imageUrl);
  if (format === "png" && blob.type === "image/png") return blob;
  if (format === "jpg" && blob.type === "image/jpeg") return blob;
  if (format === "webp" && blob.type === "image/webp") return blob;
  // Convert to desired format
  return convertImageBlob(blob, format);
}

/** Gallery images + listing files in one marketplace-ready ZIP. */
export async function downloadExportPack(
  params: {
    slug: string;
    productName: string;
    marketplaceId: MarketplaceId;
    assets: GalleryAsset[];
    listingCopy: ListingExportPayload;
    imageFormat?: ImageExportFormat;
  },
  onProgress?: (phase: string) => void
): Promise<{ imageCount: number }> {
  const { slug, productName, marketplaceId, assets, listingCopy, imageFormat = "jpg" } = params;
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
    const blob = await fetchAndConvertImage(asset.imageUrl, imageFormat);
    const ext = imageFormat === "jpg" ? "jpg" : imageFormat === "png" ? "png" : "webp";
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
  imageFormat: ImageExportFormat = "jpg",
  onProgress?: (saved: number, total: number) => void
): Promise<number> {
  const zip = new JSZip();
  const folder = zip.folder(slug) ?? zip;
  let saved = 0;

  for (const [index, asset] of assets.entries()) {
    const blob = await fetchAndConvertImage(asset.imageUrl, imageFormat);
    const ext = imageFormat === "jpg" ? "jpg" : imageFormat === "png" ? "png" : "webp";
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
