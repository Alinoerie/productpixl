import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBrandStory } from "@/lib/ai";
import { getBrandProfileForUser, isBrandOnboardingComplete } from "@/lib/brand-profile";
import { insufficientCreditsResponse, requireCredits } from "@/lib/require-credits";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
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
      guidelines?: string;
    };

    const existing = await getBrandProfileForUser(session.user.id);
    const profile = {
      ...existing,
      companyName: body.companyName ?? existing.companyName,
      companyDescription: body.companyDescription ?? existing.companyDescription,
      targetAudience: body.targetAudience ?? existing.targetAudience,
      displayName: body.displayName ?? existing.displayName,
      primaryColor: body.primaryColor ?? existing.primaryColor,
      secondaryColor: body.secondaryColor ?? existing.secondaryColor,
      tone: body.tone ?? existing.tone,
      guidelines: body.guidelines ?? existing.guidelines,
    };

    if (!profile.displayName?.trim()) {
      return NextResponse.json({ error: "Brand display name is required" }, { status: 400 });
    }

    const onboardingDone = await isBrandOnboardingComplete(session.user.id);
    if (onboardingDone) {
      const user = await requireCredits(session.user.id);
      if (!user) return insufficientCreditsResponse();
    }

    const brandStory = await generateBrandStory(profile);

    if (onboardingDone) {
      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: 1 } },
        });
      } catch (err) {
        console.error("[brand-profile/generate-story] credit decrement failed", err);
      }
    }

    return NextResponse.json({ brandStory });
  } catch (err) {
    console.error("[api/brand-profile/generate-story]", err);
    const message = err instanceof Error ? err.message : "Brand story generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
