import Replicate from "replicate";
import sharp from "sharp";
import { extractReplicateText } from "@/lib/replicate-output";
import { isStubMode, sleep } from "@/lib/utils";
import type { ListingModuleId } from "./modules";

const RATE_LIMIT_MS = 12_000;

export async function generateListingImage(
  inputImageUrl: string,
  prompt: string,
  moduleId: ListingModuleId,
  resolution: "2K" | "4K"
): Promise<Buffer> {
  if (isStubMode()) {
    await sleep(2000);
    const res = await fetch(inputImageUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    return postProcessSquare(buf);
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const output = await replicate.run("google/nano-banana-pro", {
        input: {
          prompt,
          image_input: [inputImageUrl],
          aspect_ratio: "1:1",
          resolution,
          allow_fallback_model: true,
        },
      });

      const url = extractReplicateText(output).trim();
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`Failed to download generated image: ${imgRes.status}`);
      const raw = Buffer.from(await imgRes.arrayBuffer());
      await sleep(RATE_LIMIT_MS);
      return postProcessSquare(raw);
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

async function postProcessSquare(buffer: Buffer): Promise<Buffer> {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const w = meta.width ?? 1500;
  const h = meta.height ?? 1500;
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
