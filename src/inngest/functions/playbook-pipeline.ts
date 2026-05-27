import { inngest, PLAYBOOK_PIPELINE_EVENT } from "../client";
import { prisma } from "@/lib/prisma";
import { getPlaybook, playbookContextBlock, playbookModuleSet } from "@/lib/playbooks/catalog";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { intakeFromProduct } from "@/lib/credit-pricing";
import { runImagePipelineCore } from "@/pipelines/image-pipeline-core";
import { runAplusPipelineCore } from "@/pipelines/aplus-pipeline-core";

type PlaybookPipelineEvent = {
  runId: string;
  userId: string;
  playbookSlug: string;
  productIds: string[];
  chargedCredits?: number;
};

export const playbookPipeline = inngest.createFunction(
  { id: "playbook-pipeline-run", retries: 2, timeouts: { finish: "10m" } },
  { event: PLAYBOOK_PIPELINE_EVENT },
  async ({ event, step }) => {
    const { runId, userId, playbookSlug, productIds } = event.data as PlaybookPipelineEvent;
    const playbook = getPlaybook(playbookSlug);
    if (!playbook) throw new Error("Unknown playbook");

    const brandProfile = await getBrandProfileForUser(userId);
    const playbookContext = playbookContextBlock(playbook, brandProfile.displayName || "");
    const moduleSet = playbookModuleSet(playbookSlug);

    await step.run("mark-running", async () => {
      await prisma.playbookRun.update({
        where: { id: runId },
        data: { status: "RUNNING" },
      });
    });

    let completed = 0;
    for (const productId of productIds) {
      await step.run(`product-${productId}`, async () => {
        try {
          const product = await prisma.product.findFirst({
            where: { id: productId, userId },
          });
          if (!product?.inputImageUrl) return;

          const intake = intakeFromProduct(product);
          intake.brandName = brandProfile.displayName || intake.brandName;

          if (moduleSet.pipelineType === "APLUS") {
            await runAplusPipelineCore({
              productId,
              selectedModules: moduleSet.aplusModules,
              brandRegistered: moduleSet.brandRegistered ?? product.brandRegistered,
              intake,
              playbookContext,
            });
          } else {
            await runImagePipelineCore({
              productId,
              selectedModules: moduleSet.listingModules,
              intake,
              playbookContext,
            });
          }

          completed += 1;
          await prisma.playbookRun.update({
            where: { id: runId },
            data: { completedCount: completed },
          });
        } catch (err) {
          console.error(`[playbook-pipeline] Product ${productId} failed:`, err);
        }
      });
    }

    await step.run("mark-complete", async () => {
      await prisma.playbookRun.update({
        where: { id: runId },
        data: { status: "COMPLETE", completedCount: completed },
      });
    });

    return { runId, completed };
  }
);
