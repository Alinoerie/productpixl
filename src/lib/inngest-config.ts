import { NextResponse } from "next/server";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";

/** Production needs Inngest Cloud keys; local dev runs pipelines inline. */
export function isInngestConfigured(): boolean {
  if (shouldUseInlinePipeline()) return true;
  const key = process.env.INNGEST_EVENT_KEY?.trim();
  return Boolean(key && key.length > 8 && !key.includes("placeholder"));
}

/** Local dev runs pipelines in-process so you don't need `pnpm inngest:dev`. */
export function shouldUseInlinePipeline(): boolean {
  if (process.env.PIPELINE_INLINE === "1") return true;
  if (process.env.PIPELINE_INLINE === "0") return false;
  return process.env.NODE_ENV === "development";
}

export function inngestNotConfiguredResponse() {
  return NextResponse.json(
    {
      error: PIPELINE_ERROR.notConfigured,
      code: "INNGEST_NOT_CONFIGURED",
    },
    { status: 503 }
  );
}
