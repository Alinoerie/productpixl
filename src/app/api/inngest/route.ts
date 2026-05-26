import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { imagePipeline } from "@/inngest/functions/image-pipeline";
import { copyPipeline } from "@/inngest/functions/copy-pipeline";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [imagePipeline, copyPipeline],
});
