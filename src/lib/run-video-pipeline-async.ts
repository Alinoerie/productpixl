import { PIPELINE_ERROR, sellerErrorFromUnknown } from "@/lib/pipeline-errors";
import {
  runVideoPipelineCore,
  markVideoPipelineFailed,
  type VideoPipelineInput,
} from "@/pipelines/video-pipeline-core";

export function scheduleInlineVideoPipeline(input: VideoPipelineInput, userId: string, chargedCredits: number) {
  void (async () => {
    try {
      await runVideoPipelineCore(input);
    } catch (err) {
      console.error("[inline-video-pipeline]", err);
      await markVideoPipelineFailed(
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
