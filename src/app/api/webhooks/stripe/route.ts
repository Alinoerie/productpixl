import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    if (userId && credits > 0) {
      const existing = await prisma.order.findFirst({
        where: { stripeSessionId: session.id, status: "COMPLETED" },
      });
      if (!existing) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
          }),
          prisma.order.updateMany({
            where: { stripeSessionId: session.id },
            data: {
              status: "COMPLETED",
              stripePaymentId: session.payment_intent as string | undefined,
            },
          }),
        ]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
