import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { inngest as inngestClient, BATCH_PIPELINE_EVENT } from "@/inngest/client";
import { randomUUID } from "crypto";
import type { BatchJobItem } from "@/lib/batch/types";
import type { ListingModuleId } from "@/pipelines/modules";
import { parseCsvText } from "@/lib/batch/csv";
import { quoteBatchRun } from "@/lib/credit-pricing";
import { getActiveBrandId } from "@/lib/brands";
import { intakeFromProduct } from "@/lib/credit-pricing";

type CopyCsvColumnMap = {
  name: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

type ScheduledConfig = {
  csvText: string;
  columnMap: CopyCsvColumnMap;
  marketplace: string;
  brandId?: string;
};

// Scheduled job processor - runs every minute to check for due jobs
export const scheduledBatchProcessor = inngest.createFunction(
  { id: "scheduled-batch-processor", retries: 2, timeouts: { finish: "10m" } },
  { cron: "*/1 * * * *" }, // Run every minute
  async ({ step }) => {
    const now = new Date();

    // Find all scheduled jobs that are due
    const dueJobs = await step.run("find-due-jobs", async () => {
      return prisma.scheduledBatchJob.findMany({
        where: {
          status: "SCHEDULED",
          runAt: { lte: now },
        },
        take: 5, // Process up to 5 at a time
        orderBy: { runAt: "asc" },
      });
    });

    if (dueJobs.length === 0) {
      return { processed: 0, message: "No scheduled jobs due" };
    }

    const results = [];

    for (const job of dueJobs) {
      const result = await step.run(`process-job-${job.id}`, async () => {
        try {
          // Mark as running
          await prisma.scheduledBatchJob.update({
            where: { id: job.id },
            data: { status: "RUNNING" },
          });

          const config = job.config as ScheduledConfig;
          const parsed = parseCsvText(config.csvText);
          const rows = mapCopyCsvRows(parsed.headers, parsed.rows, config.columnMap);

          if (rows.length === 0) {
            await prisma.scheduledBatchJob.update({
              where: { id: job.id },
              data: { status: "FAILED", errorMessage: "No valid rows found" },
            });
            return { jobId: job.id, status: "FAILED", reason: "No valid rows" };
          }

          const brandId = config.brandId ?? (await getActiveBrandId(job.userId));
          const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: job.userId } });
          if (!brand) {
            await prisma.scheduledBatchJob.update({
              where: { id: job.id },
              data: { status: "FAILED", errorMessage: "Brand not found" },
            });
            return { jobId: job.id, status: "FAILED", reason: "Brand not found" };
          }

          const quote = quoteBatchRun({
            rowCount: rows.length,
            kind: "copy",
            marketplace: config.marketplace,
            intake: { name: rows[0]!.name, category: rows[0]!.category ?? "General" },
          });

          const batchId = randomUUID();
          const perRowCredits = Math.max(1, Math.ceil(quote.total / Math.max(1, rows.length)));
          const items: BatchJobItem[] = [];

          for (const row of rows) {
            const product = await prisma.product.create({
              data: {
                userId: job.userId,
                brandId,
                name: row.name,
                inputImageUrl: "copy-only",
                marketplace: row.marketplace ?? config.marketplace,
                pipelineType: "COPY",
                status: "QUEUED",
                amazonCategory: row.category ?? null,
                materials: row.materials ?? null,
                colors: row.colors ?? null,
                keyFeatures: row.keyFeatures ?? null,
                targetBuyer: row.targetBuyer ?? null,
                competitors: row.competitors ?? null,
                vibe: row.vibe ?? null,
                useCase: row.useCase ?? null,
                differentiators: row.differentiators ?? null,
                dimensions: row.dimensions ?? null,
              },
            });

            items.push({
              productId: product.id,
              kind: "copy",
              marketplace: row.marketplace ?? config.marketplace,
              selectedModules: [] as ListingModuleId[],
              intake: {
                name: row.name,
                brandName: brand.name,
                category: row.category ?? "",
                materials: row.materials,
                colors: row.colors,
                keyFeatures: row.keyFeatures,
                targetBuyer: row.targetBuyer,
                competitors: row.competitors,
                vibe: row.vibe,
                useCase: row.useCase,
                differentiators: row.differentiators,
                dimensions: row.dimensions,
              },
              chargedCredits: perRowCredits,
            });
          }

          // Deduct credits
          await prisma.user.update({
            where: { id: job.userId },
            data: { credits: { decrement: quote.total } },
          });

          // Send to batch pipeline
          await inngestClient.send({
            name: BATCH_PIPELINE_EVENT,
            data: {
              userId: job.userId,
              batchId,
              items,
              totalChargedCredits: quote.total,
            },
          });

          // Mark as completed
          await prisma.scheduledBatchJob.update({
            where: { id: job.id },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              result: {
                batchId,
                rowCount: rows.length,
                creditsCharged: quote.total,
              },
            },
          });

          return { jobId: job.id, status: "COMPLETED", rowCount: rows.length };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          await prisma.scheduledBatchJob.update({
            where: { id: job.id },
            data: { status: "FAILED", errorMessage },
          });
          return { jobId: job.id, status: "FAILED", reason: errorMessage };
        }
      });

      results.push(result);
    }

    return { processed: dueJobs.length, results };
  }
);

type CopyRow = {
  name: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

function cellValue(row: string[], headers: string[], column?: string): string | undefined {
  if (!column) return undefined;
  const index = headers.indexOf(column);
  if (index < 0) return undefined;
  return row[index] || undefined;
}

function mapCopyCsvRows(
  headers: string[],
  rows: string[][],
  columnMap: CopyCsvColumnMap
): CopyRow[] {
  const mapped: CopyRow[] = [];

  rows.forEach((row, index) => {
    const lineNum = index + 2;
    const name = cellValue(row, headers, columnMap.name);

    if (!name) {
      return; // Skip invalid rows silently
    }

    mapped.push({
      name,
      category: cellValue(row, headers, columnMap.category),
      marketplace: cellValue(row, headers, columnMap.marketplace),
      materials: cellValue(row, headers, columnMap.materials),
      colors: cellValue(row, headers, columnMap.colors),
      keyFeatures: cellValue(row, headers, columnMap.keyFeatures),
      targetBuyer: cellValue(row, headers, columnMap.targetBuyer),
      competitors: cellValue(row, headers, columnMap.competitors),
      vibe: cellValue(row, headers, columnMap.vibe),
      useCase: cellValue(row, headers, columnMap.useCase),
      differentiators: cellValue(row, headers, columnMap.differentiators),
      dimensions: cellValue(row, headers, columnMap.dimensions),
    });
  });

  return mapped;
}
