import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { emailOnGenerationComplete, emailOnLowCredits, marketingUpdates, weeklyDigest } = body;

  if (
    typeof emailOnGenerationComplete !== "boolean" ||
    typeof emailOnLowCredits !== "boolean" ||
    typeof marketingUpdates !== "boolean" ||
    typeof weeklyDigest !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid preferences shape" }, { status: 400 });
  }

  const prefs = {
    emailOnGenerationComplete,
    emailOnLowCredits,
    marketingUpdates,
    weeklyDigest,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationPrefs: prefs },
  });

  return NextResponse.json({ success: true, notificationPrefs: prefs });
}
