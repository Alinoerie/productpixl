import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setActiveBrand } from "@/lib/brands";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { brandId?: string };
  if (!body.brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  try {
    const brand = await setActiveBrand(session.user.id, body.brandId);
    return NextResponse.json({ brand });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to switch brand" },
      { status: 400 }
    );
  }
}
