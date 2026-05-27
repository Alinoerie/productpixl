import { inngest, COPY_PIPELINE_EVENT } from "../client";
import {
  runCopyPipelineCore,
  runCopyPipelineMulti,
  type CopyPipelineInput,
} from "@/pipelines/copy-pipeline-core";

type CopyPipelineEvent = CopyPipelineInput & {
  marketplaces?: string[];
  chargedCredits?: number;
};

export const copyPipeline = inngest.createFunction(
  { id: "copy-pipeline-run", retries: 3 },
  { event: COPY_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as CopyPipelineEvent;

    if (input.marketplaces?.length) {
      return step.run("copy-pipeline-multi", () =>
        runCopyPipelineMulti({
          productId: input.productId,
          marketplaces: input.marketplaces!,
          intake: input.intake,
          playbooksContext: input.playbooksContext,
        })
      );
    }

    return step.run("copy-pipeline", () => runCopyPipelineCore(input));
  }
);
