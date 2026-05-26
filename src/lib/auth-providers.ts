import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { buildMagicLinkEmail, isEmailAuthConfigured } from "@/lib/email/magic-link";

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
  allowDangerousEmailAccountLinking: true,
});

const emailProvider = Email({
  from: process.env.EMAIL_FROM ?? "ProductPixl <onboarding@resend.dev>",
  maxAge: 24 * 60 * 60,
  // Required by Auth.js even when using Resend via sendVerificationRequest
  server: {
    host: "smtp.resend.com",
    port: 465,
    auth: { user: "resend", pass: process.env.AUTH_RESEND_API_KEY ?? "unused" },
  },
  sendVerificationRequest: async ({ identifier, url }) => {
    if (!isEmailAuthConfigured()) {
      throw new Error("Email sign-in is not configured. Set AUTH_RESEND_API_KEY and EMAIL_FROM.");
    }
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.AUTH_RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
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
