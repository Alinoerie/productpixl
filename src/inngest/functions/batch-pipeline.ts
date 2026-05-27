import {
  inngest,
  BATCH_PIPELINE_EVENT,
  COPY_PIPELINE_EVENT,
  IMAGE_PIPELINE_EVENT,
} from "../client";
import { prisma } from "@/lib/prisma";
import type { BatchPipelineInput } from "@/lib/batch/types";
import { listingCopyWhere } from "@/lib/listing-copy";
import { shouldUseInlinePipeline } from "@/lib/inngest-config";
import { scheduleInlineCopyPipeline } from "@/lib/run-copy-pipeline-async";
import { scheduleInlineImagePipeline } from "@/lib/run-image-pipeline-async";
import { intakeFromProduct } from "@/lib/credit-pricing";

export const batchPipeline = inngest.createFunction(
  { id: "batch-pipeline-run", retries: 3 },
  { event: BATCH_PIPELINE_EVENT },
  async ({ event, step }) => {
    const input = event.data as BatchPipelineInput;
    const useInline = shouldUseInlinePipeline();

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i]!;

      await step.run(`batch-item-${i}-${item.productId}`, async () => {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, userId: input.userId },
        });
        if (!product) return { skipped: true };

        const intake: import("@/lib/product-intake").ProductIntakeData =
          item.intake && item.intake.name
            ? (item.intake as import("@/lib/product-intake").ProductIntakeData)
            : intakeFromProduct({
                ...product,
                referenceImageUrls: product.referenceImageUrls as string[] | null,
              });

        if (item.kind === "copy" || item.kind === "both") {
          await prisma.listingCopy.upsert({
            where: listingCopyWhere(item.productId, item.marketplace),
            create: {
              productId: item.productId,
              marketplace: item.marketplace,
              status: "QUEUED",
            },
            update: { marketplace: item.marketplace, status: "QUEUED", errorMessage: null },
          });

          const copyInput = {
            productId: item.productId,
            marketplace: item.marketplace,
            intake,
          };

          if (useInline) {
            scheduleInlineCopyPipeline(copyInput, input.userId, item.chargedCredits);
          } else {
            await inngest.send({
              name: COPY_PIPELINE_EVENT,
              data: { ...copyInput, chargedCredits: item.chargedCredits },
            });
          }
        }

        if (item.kind === "image" || item.kind === "both") {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: "QUEUED" },
          });

          const imageInput = {
            productId: item.productId,
            includePackaging: Boolean(item.includePackaging),
            selectedModules: item.selectedModules,
            intake,
          };

          if (useInline) {
            scheduleInlineImagePipeline(imageInput, input.userId, item.chargedCredits);
          } else {
            await inngest.send({
              name: IMAGE_PIPELINE_EVENT,
              data: { ...imageInput, chargedCredits: item.chargedCredits },
            });
          }
        }

        return { ok: true };
      });

      if (i < input.items.length - 1) {
        await step.sleep(`rate-limit-${i}`, "12s");
      }
    }

    return { processed: input.items.length, batchId: input.batchId };
  }
);
