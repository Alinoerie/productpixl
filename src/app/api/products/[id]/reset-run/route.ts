import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resetStuckProduct } from "@/lib/reset-stuck-run";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await resetStuckProduct(session.user.id, id);

  if (!result.ok) {
    const status = result.error === "Not found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
