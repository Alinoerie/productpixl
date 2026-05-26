import { prisma } from "@/lib/prisma";

export interface BrandProfileData {
  displayName: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
  logoUrl: string | null;
  guidelines: string | null;
}

export const DEFAULT_BRAND_PROFILE: BrandProfileData = {
  displayName: null,
  primaryColor: "#B45309",
  secondaryColor: "#0D5C63",
  tone: "premium, trustworthy, conversion-focused, no hype",
  logoUrl: null,
  guidelines: null,
};

export async function getBrandProfileForUser(userId: string): Promise<BrandProfileData> {
  const row = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!row) return DEFAULT_BRAND_PROFILE;
  return {
    displayName: row.displayName,
    primaryColor: row.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
    secondaryColor: row.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
    tone: row.tone ?? DEFAULT_BRAND_PROFILE.tone,
    logoUrl: row.logoUrl,
    guidelines: row.guidelines,
  };
}

export function brandContextBlock(profile: BrandProfileData): string {
  return `Brand profile:
— Display name: ${profile.displayName ?? "the brand"}
— Primary color: ${profile.primaryColor}
— Secondary color: ${profile.secondaryColor}
— Tone: ${profile.tone}
${profile.guidelines ? `— Guidelines: ${profile.guidelines}` : ""}
Keep all visuals and implied styling consistent with this brand.`;
}

export async function isBrandProfileConfigured(userId: string): Promise<boolean> {
  const row = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!row) return false;
  if (row.displayName?.trim()) return true;
  if (row.guidelines?.trim()) return true;
  if (row.logoUrl) return true;
  if (row.tone && row.tone !== DEFAULT_BRAND_PROFILE.tone) return true;
  if (row.primaryColor && row.primaryColor !== DEFAULT_BRAND_PROFILE.primaryColor) return true;
  if (row.secondaryColor && row.secondaryColor !== DEFAULT_BRAND_PROFILE.secondaryColor) return true;
  return false;
}
