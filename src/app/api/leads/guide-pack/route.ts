import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildGuidePackEmail, isGuidePackEmailConfigured } from "@/lib/email/guide-pack";
import { getEmailFrom, getResendApiKey } from "@/lib/email/resend-config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.guidePackLead.upsert({
      where: { email },
      create: { email, source: "ecommerce-guide" },
      update: { updatedAt: new Date() },
    });
  } catch (err) {
    console.error("[guide-pack-lead]", err);
    return NextResponse.json({ error: "Could not save your request. Try again." }, { status: 500 });
  }

  let emailSent = false;
  if (isGuidePackEmailConfigured()) {
    try {
      const origin = new URL(req.url).origin;
      const apiKey = getResendApiKey();
      if (!apiKey) throw new Error("Resend API key missing");
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: getEmailFrom(),
        to: email,
        subject: "Your ProductPixl ecommerce guide pack is ready",
        html: buildGuidePackEmail({
          guideUrl: `${origin}/guides/ecommerce#unlock`,
          studioUrl: `${origin}/login`,
        }),
      });
      emailSent = !error;
      if (error) console.error("[guide-pack-email]", error);
    } catch (err) {
      console.error("[guide-pack-email]", err);
    }
  }

  return NextResponse.json({ ok: true, emailSent });
}
