import { isResendConfigured } from "@/lib/email/resend-config";
import type { WeeklyDigestData } from "@/lib/digest";

export function isDigestEmailConfigured() {
  return isResendConfigured();
}

export function buildWeeklyDigestEmail(digest: WeeklyDigestData, studioUrl: string): string {
  const { weekStart, weekEnd, creditsUsed, assetsGenerated, listingsCompleted, failedJobs } = digest;

  const weekStartStr = weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const weekEndStr = weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const statCards = [
    {
      label: "Credits used",
      value: creditsUsed,
      icon: "⚡",
    },
    {
      label: "Assets generated",
      value: assetsGenerated,
      icon: "🎨",
    },
    {
      label: "Listings completed",
      value: listingsCompleted,
      icon: "✅",
    },
  ]
    .map(
      (card) => `
    <div style="background:#f9fafb;border-radius:12px;padding:20px;text-align:center;min-width:120px;">
      <div style="font-size:24px;margin-bottom:4px;">${card.icon}</div>
      <div style="font-size:28px;font-weight:700;color:#111827;">${card.value}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">${card.label}</div>
    </div>`
    )
    .join("");

  const failedSection =
    failedJobs.length > 0
      ? `
  <div style="margin-top:24px;">
    <p style="font-size:14px;font-weight:600;color:#dc2626;margin:0 0 12px;">⚠️ Failed jobs this week</p>
    <ul style="padding-left:20px;margin:0;">
      ${failedJobs
        .slice(0, 5)
        .map(
          (job) =>
            `<li style="margin-bottom:8px;font-size:13px;color:#374151;">
        <strong>${job.productName}</strong> (${job.pipelineType})<br/>
        <span style="color:#9ca3af;">${job.errorMessage ?? "Unknown error"}</span>
      </li>`
        )
        .join("")}
    </ul>
  </div>`
      : "";

  return `<!DOCTYPE html>
<html>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
    <p style="font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6366F1;margin:0 0 4px;">ProductPixl</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 4px;">Your weekly digest</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">${weekStartStr} – ${weekEndStr}</p>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
      ${statCards}
    </div>

    ${failedSection}

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;">
        Check out your latest projects and continue where you left off.
      </p>
      <a href="${studioUrl}" style="display:inline-block;background:#6366F1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;">
        Open ProductPixl
      </a>
    </div>

    <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
      You received this because you have weekly digests enabled.
      <a href="${studioUrl}/account" style="color:#6366F1;">Manage notification preferences</a>.
    </p>
  </body>
</html>`;
}
