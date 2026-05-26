import { PIPELINE_ERROR, sellerErrorFromUnknown } from "@/lib/pipeline-errors";
import {
  runImagePipelineCore,
  markImagePipelineFailed,
  type ImagePipelineInput,
} from "@/pipelines/image-pipeline-core";

/** Fire-and-forget pipeline for local dev (no Inngest dev server required). */
export function scheduleInlineImagePipeline(input: ImagePipelineInput, userId: string, chargedCredits: number) {
  void (async () => {
    try {
      await runImagePipelineCore(input);
    } catch (err) {
      console.error("[inline-image-pipeline]", err);
      await markImagePipelineFailed(
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
