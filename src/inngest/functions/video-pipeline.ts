import { inngest, VIDEO_PIPELINE_EVENT } from "../client";
import { runVideoPipelineCore, type VideoPipelineInput } from "@/pipelines/video-pipeline-core";

export const videoPipeline = inngest.createFunction(
  { id: "video-pipeline-run", retries: 3, timeouts: { finish: "5m" } },
  { event: VIDEO_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as VideoPipelineInput;
    await step.run("run-video-pipeline", () => runVideoPipelineCore(input));
    return { productId: input.productId };
  }
);
