/** Seller-facing copy for generation failures — no Inngest/dev jargon in the UI. */

export const SUPPORT_EMAIL = "support@productpixl.app";

export const PIPELINE_ERROR = {
  notConfigured:
    "We couldn't start your run — our background processing isn't connected yet. This is usually fixed within a few hours on our side.",
  notConfiguredAction: "Try again in a little while, or contact support if it persists.",
  generationTimedOut:
    "This is taking longer than expected. Your credits weren't used for a failed run — open your project to check status or try again.",
  copyTimedOut:
    "Listing copy is taking longer than expected. Open your project to see if it finished, or try generating again.",
  queuedStale:
    "This run hasn't started after a few minutes. Retry from your project page — if it keeps happening, contact support.",
  runReset:
    "Run was reset — start a fresh generation from Image studio when you're ready.",
  generationFailed: "Something went wrong while generating. Try again from your project or start a new run.",
  copyFailed: "We couldn't finish your listing copy. Try again — your last saved copy is still on the project.",
  assetQaFailed:
    "This image didn't pass our quality check. Tap Retry below to generate a fresh version.",
  assetGenerationFailed:
    "We couldn't generate this image. Tap Retry below — you won't be charged twice for a failed module.",
  playbooksPhase2: "Batch playbook runs aren't live yet. Use Image studio and Copy studio on individual projects.",
  allModulesFailed:
    "We couldn't generate any gallery images. Try a new run from Image studio.",
  partialModulesFailed:
    "Some gallery images didn't finish. Retry the failed modules below.",
} as const;

export function supportMailto(subject: string) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** Map API / internal errors to plain language for display. */
export function toSellerPipelineError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("inngest") || raw.includes("INNGEST_NOT_CONFIGURED") || lower.includes("background job")) {
    return PIPELINE_ERROR.notConfigured;
  }
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return PIPELINE_ERROR.generationTimedOut;
  }
  return raw;
}

/** Map per-module gallery errors to plain language. */
export function toSellerAssetError(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  const lower = raw.toLowerCase();
  if (lower.includes("quality check") || lower.includes("threshold") || lower.includes("qa score")) {
    return PIPELINE_ERROR.assetQaFailed;
  }

  const mapped = toSellerPipelineError(raw);
  if (mapped !== raw) return mapped;

  if (
    lower.includes("generation failed") ||
    lower.includes("failed to generate") ||
    lower.includes("all gallery modules failed")
  ) {
    return PIPELINE_ERROR.assetGenerationFailed;
  }

  if (raw.includes("Error:") || raw.includes("ECONN") || raw.length > 140) {
    return PIPELINE_ERROR.assetGenerationFailed;
  }

  return mapped;
}

/** Normalize unknown errors before persisting or returning from APIs. */
export function sellerErrorFromUnknown(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : fallback;
  return toSellerPipelineError(raw);
}
