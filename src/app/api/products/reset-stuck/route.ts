import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resetAllStuckProducts } from "@/lib/reset-stuck-run";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await resetAllStuckProducts(session.user.id);
  return NextResponse.json({ ok: true, count: result.count });
}
