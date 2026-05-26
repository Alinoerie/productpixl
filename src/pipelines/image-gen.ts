import Replicate from "replicate";
import sharp from "sharp";
import { extractReplicateUrl } from "@/lib/replicate-output";
import { isStubMode, sleep } from "@/lib/utils";
import type { ListingModuleId } from "./modules";

const RATE_LIMIT_MS = 12_000;

export const FIDELITY_RETRY_PREFIX = `[FIDELITY CRITICAL]
The first attached image is the exact product to preserve — same shape, label text, colors, logo, and packaging.
Do NOT replace, restyle, or hallucinate a different product. Only change background, lighting, and scene as instructed.

`;

export type GenerateListingImageOptions = {
  /** Extra style/reference angles (original product URL is always first). */
  referenceImageUrls?: string[];
  /** L1 hero should not fall back to a different model. */
  allowFallback?: boolean;
};

export function buildImageInputUrls(
  inputImageUrl: string,
  referenceImageUrls: string[] = []
): string[] {
  const merged = [inputImageUrl, ...referenceImageUrls].filter(Boolean);
  const unique: string[] = [];
  for (const url of merged) {
    if (!unique.includes(url)) unique.push(url);
  }
  return unique.slice(0, 14);
}

export async function generateListingImage(
  inputImageUrl: string,
  prompt: string,
  moduleId: ListingModuleId,
  resolution: "2K" | "4K",
  options: GenerateListingImageOptions = {}
): Promise<Buffer> {
  const imageInput = buildImageInputUrls(inputImageUrl, options.referenceImageUrls);
  const allowFallback = options.allowFallback ?? moduleId !== "L1";

  if (isStubMode()) {
    await sleep(2000);
    const res = await fetch(inputImageUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    return postProcessSquare(buf, moduleId);
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const effectivePrompt =
        attempt > 0 ? `${FIDELITY_RETRY_PREFIX}${prompt}` : prompt;

      const output = await replicate.run("google/nano-banana-pro", {
        input: {
          prompt: effectivePrompt,
          image_input: imageInput,
          aspect_ratio: "1:1",
          resolution,
          allow_fallback_model: allowFallback,
        },
      });

      const url = extractReplicateUrl(output);
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`Failed to download generated image: ${imgRes.status}`);
      const raw = Buffer.from(await imgRes.arrayBuffer());
      await sleep(RATE_LIMIT_MS);
      return postProcessSquare(raw, moduleId);
    } catch (err) {
      lastError = err;
      const msg = String(err);
      if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        await sleep(15_000 * (attempt + 1));
        continue;
      }
      if (attempt < 2) await sleep(5000);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Image generation failed");
}

async function postProcessSquare(buffer: Buffer, moduleId: ListingModuleId): Promise<Buffer> {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const w = meta.width ?? 1500;
  const h = meta.height ?? 1500;

  // L1 hero: pad to square so we never crop off label edges.
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
