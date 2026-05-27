import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { generateWeeklyDigest, isWeeklyDigestEnabled } from "@/lib/digest";
import { buildWeeklyDigestEmail, isDigestEmailConfigured } from "@/lib/email/weekly-digest";

const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "http://localhost:3000";

// Runs every Monday at 09:00 UTC
export const weeklyDigestCron = inngest.createFunction(
  { id: "weekly-digest", retries: 2, timeouts: { finish: "30m" } },
  { cron: "0 9 * * 1" },
  async ({ step, logger }) => {
    const now = new Date();
    const weekEnd = now;
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    // Find all users with weekly digest enabled
    const usersWithDigest = await step.run("find-users-with-digest-enabled", async () => {
      const allUsers = await prisma.user.findMany({
        select: { id: true, notificationPrefs: true },
      });

      return allUsers
        .filter((u) => {
          if (!u.notificationPrefs) return false;
          const prefs = u.notificationPrefs as { weeklyDigest?: boolean };
          return Boolean(prefs.weeklyDigest);
        })
        .map((u) => u.id);
    });

    if (usersWithDigest.length === 0) {
      return { processed: 0, message: "No users with weekly digest enabled" };
    }

    logger.info(`Processing weekly digests for ${usersWithDigest.length} users`);

    const results = [];

    for (const userId of usersWithDigest) {
      const result = await step.run(`process-digest-${userId}`, async () => {
        try {
          const digestEnabled = await isWeeklyDigestEnabled(userId);
          if (!digestEnabled) {
            return { userId, status: "SKIPPED", reason: "Digest disabled" };
          }

          const digest = await generateWeeklyDigest(userId, weekStart, weekEnd);
          if (!digest) {
            return { userId, status: "SKIPPED", reason: "User not found" };
          }

          // If no activity, skip sending
          const hasActivity =
            digest.creditsUsed > 0 ||
            digest.assetsGenerated > 0 ||
            digest.listingsCompleted > 0;

          if (!hasActivity && digest.failedJobs.length === 0) {
            return { userId, status: "SKIPPED", reason: "No activity this week" };
          }

          const emailHtml = buildWeeklyDigestEmail(digest, STUDIO_URL);

          if (isDigestEmailConfigured()) {
            const { Resend } = await import("resend");
            const apiKey = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_API_KEY;
            if (apiKey) {
              const resend = new Resend(apiKey);
              const from = process.env.EMAIL_FROM ?? "ProductPixl <onboarding@resend.dev>";
              await resend.emails.send({
                from,
                to: digest.userEmail,
                subject: `Your ProductPixl weekly digest — ${weekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`,
                html: emailHtml,
              });
              return { userId, status: "SENT", email: digest.userEmail };
            }
          }

          // Fallback: log the digest
          console.log(`[WEEKLY DIGEST] Would send to ${digest.userEmail}:`, {
            creditsUsed: digest.creditsUsed,
            assetsGenerated: digest.assetsGenerated,
            listingsCompleted: digest.listingsCompleted,
            failedJobs: digest.failedJobs.length,
          });

          return { userId, status: "LOGGED", email: digest.userEmail };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          console.error(`[WEEKLY DIGEST] Error for user ${userId}:`, msg);
          return { userId, status: "ERROR", error: msg };
        }
      });

      results.push(result);
    }

    return {
      processed: usersWithDigest.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      results,
    };
  }
);
