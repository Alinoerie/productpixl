import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { buildMagicLinkEmail, isEmailAuthConfigured } from "@/lib/email/magic-link";
import { getEmailFrom, getResendApiKey } from "@/lib/email/resend-config";

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
  allowDangerousEmailAccountLinking: true,
});

const emailProvider = Email({
  from: getEmailFrom(),
  maxAge: 24 * 60 * 60,
  // Required by Auth.js even when using Resend via sendVerificationRequest
  server: {
    host: "smtp.resend.com",
    port: 465,
    auth: { user: "resend", pass: getResendApiKey() ?? "unused" },
  },
  sendVerificationRequest: async ({ identifier, url }) => {
    const apiKey = getResendApiKey();
    if (!isEmailAuthConfigured() || !apiKey) {
      throw new Error("Email sign-in is not configured. Set AUTH_RESEND_API_KEY or RESEND_API_KEY.");
    }
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: identifier,
      subject: "Your ProductPixl sign-in link",
      html: buildMagicLinkEmail(url),
    });
    if (error) throw new Error(error.message);
  },
});

export function getAuthProviders() {
  return [googleProvider, ...(isEmailAuthConfigured() ? [emailProvider] : [])];
}
