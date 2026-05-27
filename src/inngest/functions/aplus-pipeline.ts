import { inngest, APLUS_PIPELINE_EVENT } from "../client";
import { runAplusPipelineCore, type AplusPipelineInput } from "@/pipelines/aplus-pipeline-core";

export const aplusPipeline = inngest.createFunction(
  {
    id: "aplus-pipeline-run",
    retries: 3,
    timeouts: { finish: "5m" },
  },
  { event: APLUS_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as AplusPipelineInput;

    await step.run("run-aplus-pipeline", () => runAplusPipelineCore(input));

    return { productId: input.productId };
  }
);
