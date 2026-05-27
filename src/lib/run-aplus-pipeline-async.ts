import { PIPELINE_ERROR, sellerErrorFromUnknown } from "@/lib/pipeline-errors";
import {
  runAplusPipelineCore,
  markAplusPipelineFailed,
  type AplusPipelineInput,
} from "@/pipelines/aplus-pipeline-core";

/** Fire-and-forget A+ pipeline for local dev (no Inngest dev server required). */
export function scheduleInlineAplusPipeline(input: AplusPipelineInput, userId: string, chargedCredits: number) {
  void (async () => {
    try {
      await runAplusPipelineCore(input);
    } catch (err) {
      console.error("[inline-aplus-pipeline]", err);
      await markAplusPipelineFailed(
        input.productId,
        sellerErrorFromUnknown(err, PIPELINE_ERROR.generationFailed)
      );
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: chargedCredits } },
      });
    }
  })();
}
