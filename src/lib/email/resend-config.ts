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
