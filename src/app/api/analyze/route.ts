import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeProductImage } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { imageUrl?: string };
    try {
      body = (await req.json()) as { imageUrl?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageUrl } = body;
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }

    const analysis = await analyzeProductImage(imageUrl);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[api/analyze]", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
