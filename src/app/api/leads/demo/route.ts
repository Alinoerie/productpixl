import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildDemoBookingAdminEmail,
  buildDemoBookingConfirmationEmail,
  isDemoEmailConfigured,
} from "@/lib/email/demo-booking";
import { getEmailFrom, getResendApiKey } from "@/lib/email/resend-config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatPreferredLabel(preferredDate: string, preferredTime: string) {
  const date = new Date(`${preferredDate}T${preferredTime}:00`);
  if (Number.isNaN(date.getTime())) return `${preferredDate} ${preferredTime}`;
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    company?: string;
    platform?: string;
    skuRange?: string;
    notes?: string;
    preferredDate?: string;
    preferredTime?: string;
    timezone?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const preferredDate = body.preferredDate?.trim();
  const preferredTime = body.preferredTime?.trim();

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter your name and a valid work email." }, { status: 400 });
  }
  if (!preferredDate || !DATE_RE.test(preferredDate) || !preferredTime || !TIME_RE.test(preferredTime)) {
    return NextResponse.json({ error: "Pick a valid day and time." }, { status: 400 });
  }

  const preferredAt = new Date(`${preferredDate}T${preferredTime}:00`);
  if (Number.isNaN(preferredAt.getTime())) {
    return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
  }

  const preferredLabel = formatPreferredLabel(preferredDate, preferredTime);

  try {
    await prisma.demoBookingLead.create({
      data: {
        name,
        email,
        company: body.company?.trim() || null,
        platform: body.platform?.trim() || null,
        skuRange: body.skuRange?.trim() || null,
        notes: body.notes?.trim() || null,
        preferredAt,
        timezone: body.timezone?.trim() || null,
      },
    });
  } catch (err) {
    console.error("[demo-booking-lead]", err);
    return NextResponse.json({ error: "Could not save your booking. Try again." }, { status: 500 });
  }

  const origin = new URL(req.url).origin;

  if (isDemoEmailConfigured()) {
    try {
      const apiKey = getResendApiKey();
      if (!apiKey) throw new Error("Resend API key missing");
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const from = getEmailFrom();

      await resend.emails.send({
        from,
        to: email,
        subject: "Your ProductPixl demo request",
        html: buildDemoBookingConfirmationEmail({
          name,
          preferredLabel,
          studioUrl: `${origin}/login`,
        }),
      });

      const adminEmail = process.env.DEMO_BOOKING_NOTIFY_EMAIL?.trim();
      if (adminEmail) {
        await resend.emails.send({
          from,
          to: adminEmail,
          subject: `New demo request — ${name}`,
          html: buildDemoBookingAdminEmail({
            name,
            email,
            company: body.company?.trim(),
            platform: body.platform?.trim(),
            skuRange: body.skuRange?.trim(),
            preferredLabel,
            notes: body.notes?.trim(),
          }),
        });
      }
    } catch (err) {
      console.error("[demo-booking-email]", err);
    }
  }

  return NextResponse.json({ ok: true, preferredLabel });
}
