import Replicate from "replicate";
import { extractReplicateUrl } from "@/lib/replicate-output";
import { isStubMode, sleep } from "@/lib/utils";
import type { ListingModuleId } from "./modules";
import { postProcessListingImage } from "./post-process/listing";

const RATE_LIMIT_MS = 12_000;

export type AspectRatio = "1:1" | "3:2" | "16:9" | "21:9";
export type ImageResolution = "2K" | "4K";

export const FIDELITY_RETRY_PREFIX = `[FIDELITY CRITICAL]
The first attached image is the exact product to preserve — same shape, label text, colors, logo, and packaging.
Do NOT replace, restyle, or hallucinate a different product. Only change background, lighting, and scene as instructed.

`;

export type GenerateListingImageOptions = {
  referenceImageUrls?: string[];
  allowFallback?: boolean;
  aspectRatio?: AspectRatio;
  useComposite?: boolean;
};

export type GenerateRawImageOptions = {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  allowFallback?: boolean;
  includeProductReference?: boolean;
  inputImageUrl?: string;
  referenceImageUrls?: string[];
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

/** Low-level Replicate call — returns raw JPEG buffer before post-process. */
export async function generateRawImage(options: GenerateRawImageOptions): Promise<Buffer> {
  const {
    prompt,
    aspectRatio,
    resolution,
    allowFallback = true,
    includeProductReference = true,
    inputImageUrl,
    referenceImageUrls = [],
  } = options;

  if (isStubMode()) {
    await sleep(1500);
    if (inputImageUrl) {
      const res = await fetch(inputImageUrl);
      return Buffer.from(await res.arrayBuffer());
    }
    return Buffer.alloc(0);
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const input: Record<string, unknown> = {
        prompt,
        aspect_ratio: aspectRatio,
        resolution,
        allow_fallback_model: allowFallback,
      };
      if (includeProductReference && inputImageUrl) {
        input.image_input = buildImageInputUrls(inputImageUrl, referenceImageUrls);
      }

      const output = await replicate.run("google/nano-banana-pro", { input });
      const url = extractReplicateUrl(output);
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`Failed to download generated image: ${imgRes.status}`);
      const raw = Buffer.from(await imgRes.arrayBuffer());
      await sleep(RATE_LIMIT_MS);
      return raw;
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

export async function generateListingImage(
  inputImageUrl: string,
  prompt: string,
  moduleId: ListingModuleId,
  resolution: ImageResolution,
  options: GenerateListingImageOptions = {}
): Promise<Buffer> {
  const aspectRatio = options.aspectRatio ?? "1:1";
  const allowFallback = options.allowFallback ?? moduleId !== "L1";

  if (isStubMode()) {
    await sleep(2000);
    const res = await fetch(inputImageUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    return postProcessListingImage(buf, moduleId);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const effectivePrompt =
        attempt > 0 ? `${FIDELITY_RETRY_PREFIX}${prompt}` : prompt;

      const raw = await generateRawImage({
        prompt: effectivePrompt,
        aspectRatio,
        resolution,
        allowFallback,
        includeProductReference: !options.useComposite,
        inputImageUrl,
        referenceImageUrls: options.referenceImageUrls,
      });

      return postProcessListingImage(raw, moduleId);
    } catch (err) {
      lastError = err;
      if (attempt < 2) await sleep(5000);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Image generation failed");
}

/** Generate A+ module image with custom aspect ratio and post-process spec applied externally. */
export async function generateAplusImage(
  inputImageUrl: string,
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  options: {
    referenceImageUrls?: string[];
    allowFallback?: boolean;
    useComposite?: boolean;
  } = {}
): Promise<Buffer> {
  const raw = await generateRawImage({
    prompt,
    aspectRatio,
    resolution,
    allowFallback: options.allowFallback ?? true,
    includeProductReference: !options.useComposite,
    inputImageUrl,
    referenceImageUrls: options.referenceImageUrls,
  });
  return raw;
}
