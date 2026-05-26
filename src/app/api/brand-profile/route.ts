import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DEFAULT_BRAND_PROFILE, getBrandProfileForUser } from "@/lib/brand-profile";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getBrandProfileForUser(session.user.id);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    companyName?: string;
    companyDescription?: string;
    targetAudience?: string;
    displayName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    tone?: string;
    logoUrl?: string;
    guidelines?: string;
    brandStory?: string;
    onboardingComplete?: boolean;
  };

  const profile = await prisma.brandProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName: body.companyName ?? null,
      companyDescription: body.companyDescription ?? null,
      targetAudience: body.targetAudience ?? null,
      displayName: body.displayName ?? null,
      primaryColor: body.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
      secondaryColor: body.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
      tone: body.tone ?? DEFAULT_BRAND_PROFILE.tone,
      logoUrl: body.logoUrl ?? null,
      guidelines: body.guidelines ?? null,
      brandStory: body.brandStory ?? null,
      onboardingComplete: body.onboardingComplete ?? false,
    },
    update: {
      companyName: body.companyName ?? null,
      companyDescription: body.companyDescription ?? null,
      targetAudience: body.targetAudience ?? null,
      displayName: body.displayName ?? null,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      tone: body.tone,
      logoUrl: body.logoUrl ?? null,
      guidelines: body.guidelines ?? null,
      brandStory: body.brandStory ?? null,
      onboardingComplete: body.onboardingComplete,
    },
  });

  return NextResponse.json({ profile });
}
