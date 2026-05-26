import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, type CreditPackageKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { package: packageKey, returnTo } = (await req.json()) as {
    package?: CreditPackageKey;
    returnTo?: string;
  };
  if (!packageKey || !["starter", "growth"].includes(packageKey)) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const checkout = await createCheckoutSession(
    session.user.id,
    session.user.email,
    packageKey,
    returnTo
  );

  await prisma.order.create({
    data: {
      userId: session.user.id,
      stripeSessionId: checkout.id,
      package: packageKey,
      credits: packageKey === "starter" ? 10 : 30,
      amount: packageKey === "starter" ? 2900 : 7900,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: checkout.url });
}
