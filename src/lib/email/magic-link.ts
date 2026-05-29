export { isEmailAuthConfigured } from "@/lib/email/resend-config";

export function buildMagicLinkEmail(url: string) {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 480px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Sign in to ProductPixl</p>
    <p style="margin: 0 0 24px; color: #4b5563;">Click the button below to open your listing studio. This link expires in 24 hours.</p>
    <p style="margin: 0 0 24px;">
      <a href="${url}" style="display: inline-block; background: #F59E0B; color: #000; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 600;">
        Open ProductPixl
      </a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #6b7280;">If you did not request this email, you can ignore it.</p>
  </body>
</html>`;
}
