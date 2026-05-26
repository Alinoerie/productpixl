import { NextResponse } from "next/server";

/** Production needs Inngest Cloud keys; local dev uses the Inngest dev server without keys. */
export function isInngestConfigured(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const key = process.env.INNGEST_EVENT_KEY?.trim();
  return Boolean(key && key.length > 8 && !key.includes("placeholder"));
}

export function inngestNotConfiguredResponse() {
  return NextResponse.json(
    {
      error:
        "Image and copy generation require Inngest background jobs. Install the Inngest integration on Vercel (Marketplace → Inngest → Connect project), then redeploy.",
      code: "INNGEST_NOT_CONFIGURED",
    },
    { status: 503 }
  );
}
