import { ECOMMERCE_GUIDE_PLAYBOOKS, formatGuidePriceEur } from "@/lib/guide-pack-content";

export function buildGuidePackEmail(params: { guideUrl: string; studioUrl: string }) {
  const playbookLines = ECOMMERCE_GUIDE_PLAYBOOKS.map(
    (p) =>
      `<li style="margin: 0 0 8px;"><strong>${p.title}</strong> — ${formatGuidePriceEur(p.originalPriceEur)} <span style="color: #059669;">FREE</span><br/><span style="color: #6b7280; font-size: 13px;">${p.summary}</span></li>`
  ).join("");

  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 520px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #F59E0B; margin: 0 0 8px;">ProductPixl guide pack</p>
    <p style="font-size: 22px; font-weight: 600; margin: 0 0 12px;">Your ecommerce optimization playbooks are ready</p>
    <p style="margin: 0 0 24px; color: #4b5563;">Ten practical playbooks for Shopify, WooCommerce, PrestaShop, and LogiCommerce — unlocked at no cost.</p>
    <p style="margin: 0 0 16px;">
      <a href="${params.guideUrl}" style="display: inline-block; background: #F59E0B; color: #000; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 600;">
        Open your guide pack
      </a>
    </p>
    <ul style="padding-left: 20px; margin: 24px 0;">${playbookLines}</ul>
    <p style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #4b5563;">
      Ready to generate listing images and copy from one photo?
      <a href="${params.studioUrl}" style="color: #F59E0B;">Start free in ProductPixl →</a>
    </p>
  </body>
</html>`;
}

import { isResendConfigured } from "@/lib/email/resend-config";

export function isGuidePackEmailConfigured() {
  return isResendConfigured();
}
