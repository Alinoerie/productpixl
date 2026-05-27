import sharp from "sharp";
import { generateRawImage, type AspectRatio, type ImageResolution } from "./image-gen";

export type CompositeOptions = {
  productImageUrl: string;
  scenePrompt: string;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  targetWidth: number;
  targetHeight: number;
  /** L1/L2 center product; lifestyle modules offset right for text overlay zone. */
  centerProduct?: boolean;
};

/** Generate scene without product reference, then composite cutout product on top. */
export async function compositeProductOnScene(options: CompositeOptions): Promise<Buffer> {
  const {
    productImageUrl,
    scenePrompt,
    aspectRatio,
    resolution,
    targetWidth,
    targetHeight,
    centerProduct = true,
  } = options;

  const sceneRaw = await generateRawImage({
    prompt: scenePrompt,
    aspectRatio,
    resolution,
    allowFallback: true,
    includeProductReference: false,
  });

  const productRes = await fetch(productImageUrl);
  if (!productRes.ok) throw new Error("Failed to fetch product image for composite");
  const productBuf = Buffer.from(await productRes.arrayBuffer());

  const scene = sharp(sceneRaw).resize(targetWidth, targetHeight, { fit: "cover" });
  const sceneMeta = await scene.metadata();
  const tw = sceneMeta.width ?? targetWidth;
  const th = sceneMeta.height ?? targetHeight;

  const product = sharp(productBuf).ensureAlpha();
  const productMeta = await product.metadata();
  const ph = Math.round(th * 0.68);
  const pw = Math.round((productMeta.width ?? ph) * (ph / (productMeta.height ?? ph)));

  const resizedProduct = await product.resize(pw, ph, { fit: "inside" }).toBuffer();
  const productRgba = await sharp(resizedProduct).ensureAlpha().toBuffer();
  const { width: finalPw, height: finalPh } = await sharp(productRgba).metadata();

  const x = centerProduct
    ? Math.floor((tw - (finalPw ?? pw)) / 2)
    : Math.floor(tw * 0.52 - (finalPw ?? pw) / 2);
  const y = Math.floor((th - (finalPh ?? ph)) / 2);

  return scene
    .composite([{ input: productRgba, left: Math.max(0, x), top: Math.max(0, y) }])
    .jpeg({ quality: 95 })
    .toBuffer();
}
