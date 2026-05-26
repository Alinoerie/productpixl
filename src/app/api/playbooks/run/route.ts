import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";

/** Playbook batch runs ship in Phase 2 — block API until catalog execution is live. */
const PLAYBOOKS_ENABLED = false;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!PLAYBOOKS_ENABLED) {
    return NextResponse.json({ error: PIPELINE_ERROR.playbooksPhase2 }, { status: 503 });
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
    select: { id: true },
  });
  if (products.length !== body.productIds.length) {
    return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
  }

  const run = await prisma.playbookRun.create({
    data: {
      userId: session.user.id,
      brandId: body.brandId,
      playbookSlug: body.playbookSlug,
      name: body.name ?? playbook.title,
      status: "DRAFT",
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

  return NextResponse.json({ runId: run.id });
}
