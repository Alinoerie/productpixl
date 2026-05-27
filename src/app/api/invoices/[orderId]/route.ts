import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Stub receipt — replace with real Stripe invoice PDF URL once STRIPE_SECRET_KEY is configured
  const receipt = {
    type: "receipt",
    version: "1.0",
    order: {
      id: order.id,
      package: order.package,
      credits: order.credits,
      amount: order.amount,
      amountFormatted: new Intl.NumberFormat("en-EU", {
        style: "currency",
        currency: "EUR",
      }).format(order.amount / 100),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    },
    seller: {
      name: "ProductPixl",
      email: "support@productpixl.com",
    },
    buyer: {
      email: session.user.email,
    },
    note: "This is a provisional receipt. A full invoice will be sent via email once Stripe is fully configured.",
  };

  return NextResponse.json(receipt, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="receipt-${order.id}.json"`,
    },
  });
}
