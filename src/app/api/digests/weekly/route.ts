import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWeeklyDigest, isWeeklyDigestEnabled } from "@/lib/digest";
import { buildWeeklyDigestEmail, isDigestEmailConfigured } from "@/lib/email/weekly-digest";

const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "http://localhost:3000";

/**
 * GET /api/digests/weekly
 * Returns the current user's weekly digest (last 7 days).
 * Does NOT send email — use the cron for automated delivery.
 */
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const now = new Date();
  const weekEnd = now;
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const digestEnabled = await isWeeklyDigestEnabled(userId);
  const digest = await generateWeeklyDigest(userId, weekStart, weekEnd);

  if (!digest) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    digestEnabled,
    digest: {
      ...digest,
      emailHtml: digestEnabled ? buildWeeklyDigestEmail(digest, STUDIO_URL) : null,
    },
  });
}

/**
 * POST /api/digests/weekly
 * Manually trigger a digest email for the current user.
 * Requires weekly digest to be enabled.
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const now = new Date();
  const weekEnd = now;
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const digestEnabled = await isWeeklyDigestEnabled(userId);
  if (!digestEnabled) {
    return NextResponse.json({ error: "Weekly digest is not enabled" }, { status: 403 });
  }

  const digest = await generateWeeklyDigest(userId, weekStart, weekEnd);
  if (!digest) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (isDigestEmailConfigured()) {
    const { Resend } = await import("resend");
    const apiKey = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM ?? "ProductPixl <onboarding@resend.dev>";
      const emailHtml = buildWeeklyDigestEmail(digest, STUDIO_URL);
      await resend.emails.send({
        from,
        to: digest.userEmail,
        subject: `Your ProductPixl weekly digest — ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        html: emailHtml,
      });
      return NextResponse.json({ success: true, sent: true });
    }
  }

  console.log(`[WEEKLY DIGEST] Manually triggered for ${digest.userEmail}:`, {
    creditsUsed: digest.creditsUsed,
    assetsGenerated: digest.assetsGenerated,
    listingsCompleted: digest.listingsCompleted,
    failedJobs: digest.failedJobs.length,
  });

  return NextResponse.json({ success: true, sent: false });
}
