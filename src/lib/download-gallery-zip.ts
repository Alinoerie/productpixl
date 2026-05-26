import JSZip from "jszip";

type GalleryAsset = {
  moduleId: string;
  imageUrl: string;
};

export async function downloadGalleryZip(
  assets: GalleryAsset[],
  slug: string,
  onProgress?: (saved: number, total: number) => void
): Promise<number> {
  const zip = new JSZip();
  const folder = zip.folder(slug) ?? zip;
  let saved = 0;

  for (const [index, asset] of assets.entries()) {
    const res = await fetch(asset.imageUrl);
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
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
