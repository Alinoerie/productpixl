import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { regenerateAsset } from "@/lib/regenerate-asset";
import type { ListingModuleId } from "@/pipelines/modules";

export const maxDuration = 120;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId, assetId } = await params;
    const body = (await req.json()) as { hint?: string; moduleId?: string };
    const hint = body.hint?.trim();
    if (!hint) {
      return NextResponse.json({ error: "Describe what to change (hint required)" }, { status: 400 });
    }

    const moduleId = (body.moduleId ?? assetId.split("-").pop() ?? "L1") as ListingModuleId;

    const user = await session.user;
    const dbUser = await import("@/lib/prisma").then((m) =>
      m.prisma.user.findUnique({ where: { id: user.id } })
    );
    if (!dbUser || dbUser.credits < 1) {
      return NextResponse.json({ error: "Spot edit costs 1 credit" }, { status: 402 });
    }

    const result = await regenerateAsset({
      productId,
      userId: session.user.id,
      moduleId,
      spotEditHint: hint,
    });

    await import("@/lib/prisma").then((m) =>
      m.prisma.user.update({
        where: { id: session.user.id! },
        data: { credits: { decrement: 1 } },
      })
    );

    return NextResponse.json({
      imageUrl: result.imageUrl,
      qaScore: result.qaScore,
      status: result.asset.status,
    });
  } catch (err) {
    console.error("[regenerate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}
