import { markCopyPipelineFailed, runCopyPipelineCore, type CopyPipelineInput } from "@/pipelines/copy-pipeline-core";

/** Fire-and-forget copy pipeline for local dev (no Inngest dev server required). */
export function scheduleInlineCopyPipeline(input: CopyPipelineInput, userId: string, chargedCredits: number) {
  void (async () => {
    try {
      await runCopyPipelineCore(input);
    } catch (err) {
      console.error("[inline-copy-pipeline]", err);
      await markCopyPipelineFailed(
        input.productId,
        err instanceof Error ? err.message : "Pipeline failed"
      );
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: chargedCredits } },
      });
    }
  })();
}
