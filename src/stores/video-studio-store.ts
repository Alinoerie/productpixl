import { create } from "zustand";

export type VideoFormatId = "reels" | "amazon" | "square" | "showcase";
export type MotionStyleId = "reveal" | "lifestyle" | "kinetic" | "luxury" | "features";

type VideoStudioState = {
  previewUrl: string;
  format: VideoFormatId;
  motionStyle: MotionStyleId;
  musicEnabled: boolean;
  musicGenre: string;
  creditTotal: number;
  setPreviewUrl: (url: string) => void;
  setFormat: (format: VideoFormatId) => void;
  setMotionStyle: (style: MotionStyleId) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicGenre: (genre: string) => void;
  setCreditTotal: (total: number) => void;
};

export const useVideoStudioStore = create<VideoStudioState>((set) => ({
  previewUrl: "",
  format: "reels",
  motionStyle: "reveal",
  musicEnabled: true,
  musicGenre: "upbeat",
  creditTotal: 85,
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setFormat: (format) => set({ format }),
  setMotionStyle: (motionStyle) => set({ motionStyle }),
  setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
  setMusicGenre: (musicGenre) => set({ musicGenre }),
  setCreditTotal: (creditTotal) => set({ creditTotal }),
}));

export const VIDEO_FORMATS = [
  { id: "reels" as const, label: "Reels / TikTok", ratio: "9:16", duration: "15s", credits: 65, platforms: ["TikTok", "IG"] },
  { id: "amazon" as const, label: "Amazon video", ratio: "16:9", duration: "30s", credits: 85, platforms: ["Amazon"] },
  { id: "square" as const, label: "Square loop", ratio: "1:1", duration: "10s", credits: 45, platforms: ["Bol", "Shop"] },
  { id: "showcase" as const, label: "Full showcase", ratio: "9:16", duration: "60s", credits: 120, platforms: ["All"] },
] as const;

export const MOTION_STYLES = [
  { id: "reveal" as const, label: "Clean product reveal", example: "Slow zoom, studio lighting" },
  { id: "lifestyle" as const, label: "Lifestyle & UGC feel", example: "Handheld, natural light" },
  { id: "kinetic" as const, label: "Bold kinetic text", example: "Snap cuts, benefit callouts" },
  { id: "luxury" as const, label: "Minimal luxury float", example: "Editorial drift, muted palette" },
  { id: "features" as const, label: "Feature callout showcase", example: "Icon overlays, spec highlights" },
] as const;
