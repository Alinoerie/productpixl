import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { primaryListingCopy } from "@/lib/listing-copy";
import { inngest, BATCH_PIPELINE_EVENT } from "@/inngest/client";
import { isInngestConfigured } from "@/lib/inngest-config";
import type { BatchJobItem } from "@/lib/batch/types";
import { intakeFromProduct } from "@/lib/credit-pricing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    action?: "delete" | "export-meta" | "rerun-playbook";
    productIds?: string[];
    playbookSlug?: string;
  };

  const productIds = body.productIds?.filter(Boolean) ?? [];
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Select at least one project" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, userId: session.user.id },
    include: { assets: true, listingCopies: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "One or more projects not found" }, { status: 400 });
  }

  if (body.action === "delete") {
    await prisma.product.deleteMany({
      where: { id: { in: productIds }, userId: session.user.id },
    });
    return NextResponse.json({ deleted: productIds.length });
  }

  if (body.action === "export-meta") {
    const exports = products.map((p) => {
      const copy = primaryListingCopy(p.listingCopies, p.marketplace);
      return {
        id: p.id,
        name: p.name,
        marketplace: p.marketplace,
        pipelineType: p.pipelineType,
        playbookSlug: p.playbookSlug,
        templateSlug: p.templateSlug,
        imageCount: p.assets.filter((a) => a.imageUrl).length,
        listingCopy: copy?.title
          ? {
              title: copy.title,
              bullets: copy.bullets,
              description: copy.description,
              backendKeywords: copy.backendKeywords,
            }
          : null,
        assets: p.assets
          .filter((a) => a.imageUrl)
          .map((a) => ({ moduleId: a.moduleId, imageUrl: a.imageUrl, altText: a.altText })),
      };
    });
    return NextResponse.json({ exports });
  }

  if (body.action === "rerun-playbook") {
    if (!body.playbookSlug) {
      return NextResponse.json({ error: "playbookSlug is required" }, { status: 400 });
    }
    if (!isInngestConfigured()) {
      return NextResponse.json({ error: "Background jobs are not configured" }, { status: 503 });
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds }, userId: session.user.id },
      data: { playbookSlug: body.playbookSlug, status: "QUEUED" },
    });

    const items: BatchJobItem[] = products.map((p) => ({
      productId: p.id,
      kind: "both",
      marketplace: p.marketplace,
      intake: intakeFromProduct({
        ...p,
        referenceImageUrls: p.referenceImageUrls as string[] | null,
      }),
      chargedCredits: 0,
    }));

    await inngest.send({
      name: BATCH_PIPELINE_EVENT,
      data: {
        userId: session.user.id,
        batchId: `playbook-${Date.now()}`,
        items,
        totalChargedCredits: 0,
      },
    });

    return NextResponse.json({ queued: items.length, playbookSlug: body.playbookSlug });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
