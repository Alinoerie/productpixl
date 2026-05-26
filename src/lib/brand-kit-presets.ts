export const LISTING_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "German (DE)" },
  { value: "nl", label: "Dutch (NL)" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
  { value: "pl", label: "Polish" },
] as const;

export const TONE_PRESETS = [
  { id: "premium", label: "Premium & trustworthy", value: "premium, trustworthy, conversion-focused, no hype" },
  { id: "warm", label: "Warm & approachable", value: "warm, friendly, reassuring, shopper-first" },
  { id: "bold", label: "Bold & energetic", value: "bold, confident, benefit-led, scroll-stopping" },
  { id: "clinical", label: "Clinical & factual", value: "clinical, factual, compliance-aware, no fluff" },
  { id: "minimal", label: "Minimal & luxe", value: "minimal, luxe, understated, editorial" },
] as const;

export const VISUAL_STYLE_PRESETS = [
  { id: "studio", label: "Clean studio", value: "Clean white-background studio shots, crisp shadows, catalog-ready" },
  { id: "lifestyle", label: "Lifestyle & authentic", value: "Natural light lifestyle, real environments, in-use context" },
  { id: "infographic", label: "Bold infographic", value: "High-contrast benefit callouts, icons, Amazon main-image style" },
  { id: "premium", label: "Premium editorial", value: "Editorial lighting, muted palette, luxury PDP feel" },
] as const;

export function toneMatchesPreset(tone: string): string | null {
  const normalized = tone.trim().toLowerCase();
  const match = TONE_PRESETS.find((p) => p.value.toLowerCase() === normalized);
  return match?.id ?? null;
}

export function visualMatchesPreset(aesthetic: string | null | undefined): string | null {
  if (!aesthetic?.trim()) return null;
  const normalized = aesthetic.trim().toLowerCase();
  const match = VISUAL_STYLE_PRESETS.find((p) => p.value.toLowerCase() === normalized);
  return match?.id ?? null;
}
