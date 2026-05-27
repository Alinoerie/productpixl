import { inngest, IMAGE_PIPELINE_EVENT } from "../client";
import { runImagePipelineCore, type ImagePipelineInput } from "@/pipelines/image-pipeline-core";

export const imagePipeline = inngest.createFunction(
  {
    id: "image-pipeline-run",
    retries: 3,
    timeouts: { finish: "5m" },
  },
  { event: IMAGE_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as ImagePipelineInput;

    await step.run("run-pipeline", () => runImagePipelineCore(input));

    return { productId: input.productId };
  }
);
