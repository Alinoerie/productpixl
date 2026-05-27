import sharp from "sharp";

export type AplusPostProcessSpec = {
  width: number;
  height: number;
  /** Center-crop height after width resize (970×300 modules). */
  cropHeight?: boolean;
};

/** Post-process A+ module output to exact Amazon pixel dimensions. */
export async function postProcessAplusImage(
  buffer: Buffer,
  spec: AplusPostProcessSpec
): Promise<Buffer> {
  let img = sharp(buffer);
  const meta = await img.metadata();
  const srcW = meta.width ?? spec.width;
  const srcH = meta.height ?? spec.height;

  if (spec.cropHeight) {
    const scale = spec.width / srcW;
    img = sharp(
      await img
        .resize(spec.width, Math.max(spec.height, Math.round(srcH * scale)))
        .toBuffer()
    );
    const cropped = await img.metadata();
    const h = cropped.height ?? spec.height;
    const top = Math.max(0, Math.floor((h - spec.height) / 2));
    return img
      .extract({ left: 0, top, width: spec.width, height: spec.height })
      .jpeg({ quality: 95 })
      .toBuffer();
  }

  if (srcW !== spec.width || srcH !== spec.height) {
    return img.resize(spec.width, spec.height, { fit: "cover" }).jpeg({ quality: 95 }).toBuffer();
  }

  return img.jpeg({ quality: 95 }).toBuffer();
}
