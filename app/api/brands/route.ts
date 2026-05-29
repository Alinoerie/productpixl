import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBrand, listBrandsForUser } from "@/lib/brands";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const brands = await listBrandsForUser(session.user.id);
  return NextResponse.json({ brands });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { name?: string; description?: string };
  try {
    const brand = await createBrand(session.user.id, {
      name: body.name ?? "",
      description: body.description,
    });
    return NextResponse.json({ brand });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create brand" },
      { status: 400 }
    );
  }
}
