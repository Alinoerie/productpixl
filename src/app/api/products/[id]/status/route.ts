import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isQueuedStale, pipelineProgressPercent, type PipelineStatusShape } from "@/lib/pipeline-progress";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      status: true,
      pipelineStatus: true,
      pipelineType: true,
      updatedAt: true,
      assets: true,
      listingCopy: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pipelineStatus = product.pipelineStatus as PipelineStatusShape | null;
  const queuedStale = isQueuedStale(product.status, product.pipelineStatus, product.updatedAt);

  return NextResponse.json({
    ...product,
    queuedStale,
    progress: pipelineProgressPercent(product.status, pipelineStatus),
  });
}
