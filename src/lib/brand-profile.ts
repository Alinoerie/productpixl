import { prisma } from "@/lib/prisma";

export interface BrandProfileData {
  companyName: string | null;
  companyDescription: string | null;
  targetAudience: string | null;
  displayName: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
  logoUrl: string | null;
  guidelines: string | null;
  brandStory: string | null;
  onboardingComplete: boolean;
}

export const DEFAULT_BRAND_PROFILE: BrandProfileData = {
  companyName: null,
  companyDescription: null,
  targetAudience: null,
  displayName: null,
  primaryColor: "#B45309",
  secondaryColor: "#0D5C63",
  tone: "premium, trustworthy, conversion-focused, no hype",
  logoUrl: null,
  guidelines: null,
  brandStory: null,
  onboardingComplete: false,
};

function mapRow(row: {
  companyName: string | null;
  companyDescription: string | null;
  targetAudience: string | null;
  displayName: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
  logoUrl: string | null;
  guidelines: string | null;
  brandStory: string | null;
  onboardingComplete: boolean;
}): BrandProfileData {
  return {
    companyName: row.companyName,
    companyDescription: row.companyDescription,
    targetAudience: row.targetAudience,
    displayName: row.displayName,
    primaryColor: row.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
    secondaryColor: row.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
    tone: row.tone ?? DEFAULT_BRAND_PROFILE.tone,
    logoUrl: row.logoUrl,
    guidelines: row.guidelines,
    brandStory: row.brandStory,
    onboardingComplete: row.onboardingComplete,
  };
}

export async function getBrandProfileForUser(userId: string): Promise<BrandProfileData> {
  const row = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!row) return DEFAULT_BRAND_PROFILE;
  return mapRow(row);
}

export function brandContextBlock(profile: BrandProfileData): string {
  const lines = [
    "Brand & company context:",
    profile.companyName ? `— Company: ${profile.companyName}` : null,
    profile.displayName ? `— Brand name: ${profile.displayName}` : null,
    profile.targetAudience ? `— Target audience: ${profile.targetAudience}` : null,
    `— Primary color: ${profile.primaryColor}`,
    `— Secondary color: ${profile.secondaryColor}`,
    `— Tone of voice: ${profile.tone}`,
    profile.logoUrl ? `— Logo on file: preserve exact logo typography and colors when visible on product/packaging.` : null,
    profile.brandStory ? `— Brand story: ${profile.brandStory}` : null,
    profile.companyDescription ? `— Company positioning: ${profile.companyDescription}` : null,
    profile.guidelines ? `— Creative guidelines: ${profile.guidelines}` : null,
    "Keep all visuals, implied styling, and copy voice consistent with this brand.",
  ].filter(Boolean);

  return lines.join("\n");
}

export async function isBrandProfileConfigured(userId: string): Promise<boolean> {
  return isBrandOnboardingComplete(userId);
}

export async function isBrandOnboardingComplete(userId: string): Promise<boolean> {
  const row = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!row?.onboardingComplete) return false;
  if (!row.displayName?.trim()) return false;
  if (!row.tone?.trim()) return false;
  if (!row.brandStory?.trim()) return false;
  return true;
}
