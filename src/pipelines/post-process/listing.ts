import sharp from "sharp";
import type { ListingModuleId } from "../modules";

/** Post-process listing images to 1500×1500 square JPEG. */
export async function postProcessListingImage(
  buffer: Buffer,
  moduleId: ListingModuleId
): Promise<Buffer> {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const w = meta.width ?? 1500;
  const h = meta.height ?? 1500;

  if (moduleId === "L1") {
    return img
      .resize(1500, 1500, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 95 })
      .toBuffer();
  }

  const size = Math.min(w, h);
  return img
    .extract({
      left: Math.floor((w - size) / 2),
      top: Math.floor((h - size) / 2),
      width: size,
      height: size,
    })
    .resize(1500, 1500, { fit: "cover" })
    .jpeg({ quality: 95 })
    .toBuffer();
}
