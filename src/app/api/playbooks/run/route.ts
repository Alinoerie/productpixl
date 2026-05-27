import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";
import { inngest, PLAYBOOK_PIPELINE_EVENT } from "@/inngest/client";
import { isInngestConfigured, inngestNotConfiguredResponse } from "@/lib/inngest-config";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";
import { estimatePlaybookCredits } from "@/lib/playbooks/catalog";
import { intakeFromProduct } from "@/lib/credit-pricing";

/** Playbook batch runs — fan-out to listing or A+ pipelines per product. */
const PLAYBOOKS_ENABLED = true;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!PLAYBOOKS_ENABLED) {
    return NextResponse.json({ error: PIPELINE_ERROR.playbooksPhase2 }, { status: 503 });
  }

  if (!isInngestConfigured()) {
    return inngestNotConfiguredResponse();
  }

  const { getPlaybook } = await import("@/lib/playbooks/catalog");
  const { prisma } = await import("@/lib/prisma");

  const body = (await req.json()) as {
    playbookSlug?: string;
    brandId?: string;
    productIds?: string[];
    name?: string;
  };

  if (!body.playbookSlug || !body.brandId || !body.productIds?.length) {
    return NextResponse.json({ error: "playbookSlug, brandId, and productIds are required" }, { status: 400 });
  }

  const playbook = getPlaybook(body.playbookSlug);
  if (!playbook) return NextResponse.json({ error: "Unknown playbook" }, { status: 404 });

  const brand = await prisma.brand.findFirst({
    where: { id: body.brandId, userId: session.user.id },
  });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { id: { in: body.productIds }, userId: session.user.id },
  });
  if (products.length !== body.productIds.length) {
    return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
  }

  const sample = products[0]!;
  const quoteTotal = estimatePlaybookCredits(
    body.playbookSlug,
    products.length,
    intakeFromProduct(sample)
  );

  const user = await requireCredits(session.user.id, quoteTotal);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quoteTotal, available);
  }

  const run = await prisma.playbookRun.create({
    data: {
      userId: session.user.id,
      brandId: body.brandId,
      playbookSlug: body.playbookSlug,
      name: body.name ?? playbook.title,
      status: "QUEUED",
      totalCredits: quoteTotal,
      config: { productIds: body.productIds },
    },
  });

  await prisma.product.updateMany({
    where: { id: { in: body.productIds } },
    data: { brandId: body.brandId, playbookSlug: body.playbookSlug, playbookRunId: run.id },
  });

  await prisma.savedPlaybook.create({
    data: {
      userId: session.user.id,
      brandId: body.brandId,
      playbookSlug: body.playbookSlug,
      name: body.name ?? `${playbook.title} · ${brand.name}`,
      config: { productIds: body.productIds },
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: quoteTotal } },
  });

  try {
    await inngest.send({
      name: PLAYBOOK_PIPELINE_EVENT,
      data: {
        runId: run.id,
        userId: session.user.id,
        playbookSlug: body.playbookSlug,
        productIds: body.productIds,
        chargedCredits: quoteTotal,
      },
    });
  } catch (err) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: quoteTotal } },
    });
    await prisma.playbookRun.update({
      where: { id: run.id },
      data: { status: "FAILED" },
    });
    console.error("[playbooks/run] inngest.send failed:", err);
    return NextResponse.json({ error: "Could not start playbook run" }, { status: 503 });
  }

  return NextResponse.json({ runId: run.id, creditsCharged: quoteTotal });
}
