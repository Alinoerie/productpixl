import { create } from "zustand";
import type { MarketplaceId } from "@/lib/marketplaces";

export type CopyDraft = {
  title: string;
  bullets: string[];
  description: string;
  backendKeywords: string;
};

type CopyStudioState = {
  marketplaces: MarketplaceId[];
  draft: CopyDraft;
  rufusScore: number;
  creditTotal: number;
  setMarketplaces: (ids: MarketplaceId[]) => void;
  setDraft: (patch: Partial<CopyDraft>) => void;
  setRufusScore: (score: number) => void;
  setCreditTotal: (total: number) => void;
  reset: () => void;
};

const emptyDraft: CopyDraft = {
  title: "",
  bullets: ["", "", "", "", ""],
  description: "",
  backendKeywords: "",
};

export const useCopyStudioStore = create<CopyStudioState>((set) => ({
  marketplaces: ["AMAZON_US"],
  draft: emptyDraft,
  rufusScore: 0,
  creditTotal: 0,
  setMarketplaces: (marketplaces) => set({ marketplaces }),
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setRufusScore: (rufusScore) => set({ rufusScore }),
  setCreditTotal: (creditTotal) => set({ creditTotal }),
  reset: () => set({ marketplaces: ["AMAZON_US"], draft: emptyDraft, rufusScore: 0, creditTotal: 0 }),
}));

/** Lightweight RUFUS-style heuristic for live preview */
export function computeRufusScore(draft: CopyDraft): number {
  let score = 40;
  const title = draft.title.trim();
  if (title.length >= 80 && title.length <= 180) score += 15;
  else if (title.length > 0) score += 8;
  const bullets = draft.bullets.filter((b) => b.trim().length > 0);
  score += Math.min(bullets.length * 6, 30);
  const benefitWords = /\b(for|with|helps|perfect|designed|easy|premium|durable|fast)\b/gi;
  const text = [title, ...bullets, draft.description].join(" ");
  const matches = text.match(benefitWords)?.length ?? 0;
  score += Math.min(matches * 2, 15);
  if (draft.description.trim().length > 120) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}
