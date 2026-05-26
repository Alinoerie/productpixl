import { prisma } from "@/lib/prisma";
import { PIPELINE_ERROR } from "@/lib/pipeline-errors";

export function resetRunPipelineStatus() {
  const now = new Date().toISOString();
  return {
    phase: "FAILED" as const,
    error: PIPELINE_ERROR.runReset,
    steps: [],
    currentStepIndex: 0,
    startedAt: now,
    completedAt: now,
  };
}

export async function resetStuckProduct(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true, status: true },
  });

  if (!product) {
    return { ok: false as const, error: "Not found" };
  }

  if (product.status !== "QUEUED" && product.status !== "PROCESSING") {
    return { ok: false as const, error: "Not in a running state" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "FAILED",
      pipelineStatus: resetRunPipelineStatus(),
    },
  });

  return { ok: true as const };
}

export async function resetAllStuckProducts(userId: string) {
  const stuck = await prisma.product.findMany({
    where: {
      userId,
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    select: { id: true },
  });

  if (stuck.length === 0) {
    return { ok: true as const, count: 0 };
  }

  const result = await prisma.product.updateMany({
    where: {
      userId,
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    data: {
      status: "FAILED",
      pipelineStatus: resetRunPipelineStatus(),
    },
  });

  return { ok: true as const, count: result.count };
}
