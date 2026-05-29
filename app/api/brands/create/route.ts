import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBrand } from "@/lib/brands";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const brand = await createBrand(session.user.id, {
      name: body.name,
      description: body.description,
    });
    return NextResponse.json({ brand });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create brand";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
