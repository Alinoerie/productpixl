/** Unified video format definitions for studio + pipeline. */
export type VideoFormatId = "reels_9_16" | "amazon_16_9" | "tiktok_9_16" | "square_1_1";

export type VideoFormatSpec = {
  id: VideoFormatId;
  label: string;
  ratio: string;
  duration: string;
  credits: number;
  platforms: string[];
  aspectRatio: "9:16" | "16:9" | "1:1";
  width: number;
  height: number;
  replicateMotion: string;
};

export const VIDEO_FORMAT_SPECS: VideoFormatSpec[] = [
  {
    id: "reels_9_16",
    label: "Reels / TikTok",
    ratio: "9:16",
    duration: "15s",
    credits: 80,
    platforms: ["TikTok", "IG Reels"],
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    replicateMotion: "slow cinematic push-in with subtle parallax",
  },
  {
    id: "tiktok_9_16",
    label: "TikTok Shop",
    ratio: "9:16",
    duration: "15s",
    credits: 85,
    platforms: ["TikTok Shop"],
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    replicateMotion: "energetic handheld micro-movement",
  },
  {
    id: "amazon_16_9",
    label: "Amazon video",
    ratio: "16:9",
    duration: "30s",
    credits: 95,
    platforms: ["Amazon"],
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    replicateMotion: "smooth studio orbit around product hero",
  },
  {
    id: "square_1_1",
    label: "Square loop",
    ratio: "1:1",
    duration: "10s",
    credits: 45,
    platforms: ["Bol", "Shopify"],
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    replicateMotion: "gentle floating product loop",
  },
];

export function getVideoFormat(id: string): VideoFormatSpec {
  return VIDEO_FORMAT_SPECS.find((f) => f.id === id) ?? VIDEO_FORMAT_SPECS[0]!;
}

export function formatCreditsForVideo(formatId: string): number {
  return getVideoFormat(formatId).credits;
}

/** Legacy store ids → unified format ids */
export function normalizeVideoFormatId(format: string): VideoFormatId {
  if (format === "reels") return "reels_9_16";
  if (format === "amazon") return "amazon_16_9";
  if (format === "square") return "square_1_1";
  if (format === "showcase") return "tiktok_9_16";
  if (VIDEO_FORMAT_SPECS.some((f) => f.id === format)) return format as VideoFormatId;
  return "reels_9_16";
}

export const MOTION_STYLE_PROMPTS: Record<string, string> = {
  reveal: "slow cinematic reveal, studio lighting, gentle zoom",
  lifestyle: "handheld natural light, subtle ambient motion",
  kinetic: "bold snap cuts feel, dynamic energy, punchy motion",
  luxury: "minimal editorial drift, muted palette, slow float",
  features: "feature highlight orbit, spec callout energy",
  slow_pan: "slow horizontal pan across product",
};
