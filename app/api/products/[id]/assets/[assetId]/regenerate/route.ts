import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateAsset } from "@/lib/regenerate-asset";
import {
  intakeFromProduct,
  quoteRegenerateModule,
} from "@/lib/credit-pricing";
import { getUserCredits, insufficientCreditsResponse, requireCredits } from "@/lib/require-credits";
import { LISTING_MODULE_LIBRARY, type ListingModuleId } from "@/pipelines/modules";

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

    const rawModuleId = body.moduleId ?? assetId.split("-").pop() ?? "L1";
    // Validate moduleId against the known library — reject unknown values
    const ALL_MODULE_IDS: ListingModuleId[] = ["L1","L2","L3","L4","L5","L6","L7","L8","L9","L10","L11","L12"];
    if (!(ALL_MODULE_IDS as string[]).includes(rawModuleId)) {
      return NextResponse.json(
        { error: `Invalid moduleId: ${rawModuleId}. Valid values: ${ALL_MODULE_IDS.join(", ")}` },
        { status: 400 }
      );
    }
    const moduleId = rawModuleId as ListingModuleId;

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const intake = intakeFromProduct(product);
    const quote = quoteRegenerateModule(moduleId, product.marketplace, intake);

    if (!(await requireCredits(session.user.id, quote.total))) {
      const available = await getUserCredits(session.user.id);
      return insufficientCreditsResponse(quote.total, available);
    }

    const result = await regenerateAsset({
      productId,
      userId: session.user.id,
      moduleId,
      spotEditHint: hint,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: quote.total } },
    });

    return NextResponse.json({
      imageUrl: result.imageUrl,
      qaScore: result.qaScore,
      status: result.asset.status,
      creditsCharged: quote.total,
    });
  } catch (err) {
    console.error("[regenerate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}
