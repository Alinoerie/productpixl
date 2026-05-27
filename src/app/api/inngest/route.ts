import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { imagePipeline } from "@/inngest/functions/image-pipeline";
import { aplusPipeline } from "@/inngest/functions/aplus-pipeline";
import { copyPipeline } from "@/inngest/functions/copy-pipeline";
import { videoPipeline } from "@/inngest/functions/video-pipeline";
import { playbookPipeline } from "@/inngest/functions/playbook-pipeline";
import { batchPipeline } from "@/inngest/functions/batch-pipeline";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [imagePipeline, aplusPipeline, copyPipeline, videoPipeline, playbookPipeline, batchPipeline],
});
