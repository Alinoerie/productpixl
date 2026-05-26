import { getActiveBrand } from "@/lib/brands";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BRAND_PROFILE,
  type BrandProfileData,
} from "@/lib/brand-profile-types";

export type { BrandProfileData } from "@/lib/brand-profile-types";
export { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile-types";

function mapBrandToProfile(brand: Awaited<ReturnType<typeof getActiveBrand>>): BrandProfileData {
  return {
    companyName: brand.companyName ?? brand.name,
    companyDescription: brand.companyDescription,
    targetAudience: brand.targetAudience,
    displayName: brand.displayName ?? brand.name,
    primaryColor: brand.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
    secondaryColor: brand.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
    tone: brand.tone ?? DEFAULT_BRAND_PROFILE.tone,
    logoUrl: brand.logoUrl,
    guidelines: brand.guidelines,
    brandStory: brand.brandStory,
    onboardingComplete: brand.onboardingComplete,
    language: brand.language,
    tagline: brand.tagline,
    brandValues: brand.brandValues,
    brandAesthetic: brand.brandAesthetic,
  };
}

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

/** Active sidebar brand — used by studios and pipelines. */
export async function getBrandProfileForUser(userId: string): Promise<BrandProfileData> {
  try {
    const brand = await getActiveBrand(userId);
    return mapBrandToProfile(brand);
  } catch {
    const row = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!row) return DEFAULT_BRAND_PROFILE;
    return mapRow(row);
  }
}

export function brandContextBlock(profile: BrandProfileData): string {
  const lines = [
    "Brand & listing context:",
    profile.displayName ? `— Brand on listings: ${profile.displayName}` : null,
    profile.tagline ? `— Tagline / promise: ${profile.tagline}` : null,
    profile.language ? `— Listing language: ${profile.language}` : null,
    profile.targetAudience ? `— Target shopper: ${profile.targetAudience}` : null,
    profile.brandAesthetic ? `— Visual style: ${profile.brandAesthetic}` : null,
    profile.brandValues ? `— Brand values: ${profile.brandValues}` : null,
    `— Primary color: ${profile.primaryColor}`,
    `— Accent color: ${profile.secondaryColor}`,
    `— Tone of voice: ${profile.tone}`,
    profile.logoUrl ? `— Logo on file: preserve exact logo typography and colors when visible on product/packaging.` : null,
    profile.brandStory ? `— About the brand: ${profile.brandStory}` : null,
    profile.companyDescription ? `— Positioning: ${profile.companyDescription}` : null,
    profile.guidelines ? `— Generation rules (must follow): ${profile.guidelines}` : null,
    "Keep all visuals, implied styling, and copy voice consistent with this brand kit.",
  ].filter(Boolean);

  return lines.join("\n");
}

export async function isBrandProfileConfigured(userId: string): Promise<boolean> {
  return isBrandOnboardingComplete(userId);
}

export async function isBrandOnboardingComplete(userId: string): Promise<boolean> {
  const { isActiveBrandOnboardingComplete } = await import("@/lib/brands");
  const activeComplete = await isActiveBrandOnboardingComplete(userId);
  if (activeComplete) return true;

  const row = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!row?.onboardingComplete) return false;
  if (!row.displayName?.trim()) return false;
  if (!row.tone?.trim()) return false;
  if (!row.brandStory?.trim()) return false;
  return true;
}
