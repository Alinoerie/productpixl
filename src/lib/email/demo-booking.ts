import { DEMO_DURATION_MINUTES } from "@/lib/demo-booking-content";

export function buildDemoBookingConfirmationEmail(params: {
  name: string;
  preferredLabel: string;
  studioUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 520px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6366F1; margin: 0 0 8px;">ProductPixl demo</p>
    <p style="font-size: 22px; font-weight: 600; margin: 0 0 12px;">You&apos;re booked, ${params.name.split(" ")[0] || "there"}</p>
    <p style="margin: 0 0 16px; color: #4b5563;">
      We received your ${DEMO_DURATION_MINUTES}-minute demo request for <strong>${params.preferredLabel}</strong>.
      Our team will confirm by email shortly with a calendar invite and video link.
    </p>
    <p style="margin: 0 0 24px; color: #4b5563;">
      Want to explore on your own first? Start with 10 free credits in the studio.
    </p>
    <p style="margin: 0;">
      <a href="${params.studioUrl}" style="display: inline-block; background: #6366F1; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 600;">
        Open ProductPixl
      </a>
    </p>
  </body>
</html>`;
}

export function buildDemoBookingAdminEmail(params: {
  name: string;
  email: string;
  company?: string;
  platform?: string;
  skuRange?: string;
  preferredLabel: string;
  notes?: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 520px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 18px; font-weight: 600; margin: 0 0 16px;">New ProductPixl demo request</p>
    <ul style="padding-left: 20px; margin: 0;">
      <li><strong>Name:</strong> ${params.name}</li>
      <li><strong>Email:</strong> ${params.email}</li>
      <li><strong>Company:</strong> ${params.company || "—"}</li>
      <li><strong>Platform:</strong> ${params.platform || "—"}</li>
      <li><strong>Catalog size:</strong> ${params.skuRange || "—"}</li>
      <li><strong>Preferred time:</strong> ${params.preferredLabel}</li>
      <li><strong>Notes:</strong> ${params.notes || "—"}</li>
    </ul>
  </body>
</html>`;
}

export function isDemoEmailConfigured() {
  return Boolean(process.env.AUTH_RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}
