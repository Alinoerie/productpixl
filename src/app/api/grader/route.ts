import { NextRequest, NextResponse } from "next/server";
import { gradeListing } from "@/lib/listing-grader";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      bullets?: string[];
      description?: string;
      backendKeywords?: string;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = gradeListing({
      title: body.title,
      bullets: body.bullets ?? [],
      description: body.description,
      backendKeywords: body.backendKeywords,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[grader]", err);
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
