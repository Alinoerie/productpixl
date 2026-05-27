export const STUDIO_TRANSITION = {
  micro: "duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
  panel: "duration-250 ease-out",
  lift: "duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
} as const;

export function motionSafe(className: string, reducedFallback = ""): string {
  return `${className} motion-reduce:${reducedFallback || "transition-none transform-none animate-none"}`;
}
