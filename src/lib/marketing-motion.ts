/** Shared easing + timing for public marketing pages (Jakub polish + Jhey expression). */
export const MKT_EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
  elastic: "elastic.out(1, 0.6)",
} as const;

export const MKT_DURATION = {
  hero: 0.85,
  section: 0.9,
  card: 0.65,
  micro: 0.35,
} as const;
