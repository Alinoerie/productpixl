import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile";
import { getActiveBrand, getActiveBrandId } from "@/lib/brands";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const brand = await getActiveBrand(session.user.id);
  const profile = {
    companyName: brand.companyName,
    companyDescription: brand.companyDescription,
    targetAudience: brand.targetAudience,
    displayName: brand.displayName ?? brand.name,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    tone: brand.tone,
    logoUrl: brand.logoUrl,
    guidelines: brand.guidelines,
    brandStory: brand.brandStory,
    onboardingComplete: brand.onboardingComplete,
    language: brand.language,
    tagline: brand.tagline,
    brandValues: brand.brandValues,
    brandAesthetic: brand.brandAesthetic,
    brandId: brand.id,
    brandName: brand.name,
  };
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
    language?: string;
    tagline?: string;
    brandValues?: string;
    brandAesthetic?: string;
  };

  const brandId = await getActiveBrandId(session.user.id);

  const brand = await prisma.brand.update({
    where: { id: brandId },
    data: {
      name: body.displayName?.trim() || undefined,
      companyName: body.companyName ?? null,
      companyDescription: body.companyDescription ?? null,
      targetAudience: body.targetAudience ?? null,
      primaryColor: body.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
      secondaryColor: body.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
      tone: body.tone ?? DEFAULT_BRAND_PROFILE.tone,
      logoUrl: body.logoUrl ?? null,
      guidelines: body.guidelines ?? null,
      brandStory: body.brandStory ?? null,
      onboardingComplete: body.onboardingComplete ?? false,
      language: body.language ?? "en",
      tagline: body.tagline ?? null,
      brandValues: body.brandValues ?? null,
      brandAesthetic: body.brandAesthetic ?? null,
    },
  });

  await prisma.brandProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName: body.companyName ?? null,
      companyDescription: body.companyDescription ?? null,
      targetAudience: body.targetAudience ?? null,
      displayName: body.displayName ?? brand.name,
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
      displayName: body.displayName ?? brand.name,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      tone: body.tone,
      logoUrl: body.logoUrl ?? null,
      guidelines: body.guidelines ?? null,
      brandStory: body.brandStory ?? null,
      onboardingComplete: body.onboardingComplete,
    },
  });

  return NextResponse.json({ profile: body });
}
