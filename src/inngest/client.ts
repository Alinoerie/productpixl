import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "cursorproductpixl" });

export const IMAGE_PIPELINE_EVENT = "productpixl/image-pipeline.run";
export const APLUS_PIPELINE_EVENT = "productpixl/aplus-pipeline.run";
export const COPY_PIPELINE_EVENT = "productpixl/copy-pipeline.run";
export const VIDEO_PIPELINE_EVENT = "productpixl/video-pipeline.run";
export const PLAYBOOK_PIPELINE_EVENT = "productpixl/playbook-pipeline.run";
export const BATCH_PIPELINE_EVENT = "productpixl/batch-pipeline.run";
