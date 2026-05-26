import { inngest, COPY_PIPELINE_EVENT } from "../client";
import { runCopyPipelineCore, type CopyPipelineInput } from "@/pipelines/copy-pipeline-core";

export const copyPipeline = inngest.createFunction(
  { id: "copy-pipeline-run", retries: 3 },
  { event: COPY_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as CopyPipelineInput;
    return step.run("copy-pipeline", () => runCopyPipelineCore(input));
  }
);
