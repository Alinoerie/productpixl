const DEFAULT_EMAIL_FROM = "ProductPixl <onboarding@resend.dev>";

/** Resend API key — supports Vercel integration (`RESEND_API_KEY`) and app alias (`AUTH_RESEND_API_KEY`). */
export function getResendApiKey(): string | undefined {
  const key =
    process.env.AUTH_RESEND_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  return key || undefined;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey());
}

/** Magic link + transactional email (requires verified sender in production). */
export function isEmailAuthConfigured(): boolean {
  return isResendConfigured();
}

export type EmailConfigStatus = {
  configured: boolean;
  from: string;
  productionReady: boolean;
  usingDefaultFrom: boolean;
  warning: string | null;
};

/** Surface Resend readiness for account/admin banners. */
export function getEmailConfigStatus(): EmailConfigStatus {
  const configured = isResendConfigured();
  const from = getEmailFrom();
  const usingDefaultFrom = from.includes("onboarding@resend.dev");
  const productionReady = configured && !usingDefaultFrom;

  let warning: string | null = null;
  if (!configured) {
    warning = "Resend API key missing — transactional email is disabled.";
  } else if (usingDefaultFrom) {
    warning = "Set EMAIL_FROM to a verified domain before production sends.";
  }

  return { configured, from, productionReady, usingDefaultFrom, warning };
}
