import { cookies } from "next/headers";
import type { BrandProfileData } from "@/lib/brand-profile-types";
import { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile-types";
import { prisma } from "@/lib/prisma";

export const ACTIVE_BRAND_COOKIE = "pp-active-brand";
export const SOFT_BRAND_LIMIT = 5;

export type BrandSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  logoUrl: string | null;
  onboardingComplete: boolean;
};

export type BrandRecord = BrandSummary & BrandProfileData & {
  language: string;
  tagline: string | null;
  brandValues: string | null;
  brandAesthetic: string | null;
  amazonUrl: string | null;
};

function mapBrandRow(row: {
  id: string;
  name: string;
  isDefault: boolean;
  logoUrl: string | null;
  language: string;
  tagline: string | null;
  tone: string;
  targetAudience: string | null;
  brandValues: string | null;
  brandAesthetic: string | null;
  primaryColor: string;
  secondaryColor: string;
  companyName: string | null;
  companyDescription: string | null;
  guidelines: string | null;
  brandStory: string | null;
  onboardingComplete: boolean;
  amazonUrl: string | null;
}): BrandRecord {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.isDefault,
    logoUrl: row.logoUrl,
    language: row.language,
    tagline: row.tagline,
    brandValues: row.brandValues,
    brandAesthetic: row.brandAesthetic,
    amazonUrl: row.amazonUrl,
    companyName: row.companyName,
    companyDescription: row.companyDescription,
    targetAudience: row.targetAudience,
    displayName: row.name,
    primaryColor: row.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
    secondaryColor: row.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
    tone: row.tone ?? DEFAULT_BRAND_PROFILE.tone,
    guidelines: row.guidelines,
    brandStory: row.brandStory,
    onboardingComplete: row.onboardingComplete,
  };
}

/** One-time copy of legacy BrandProfile fields into the default Brand row. */
async function migrateLegacyBrandProfile(userId: string, brandId: string) {
  const legacy = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!legacy) return;

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return;

  await prisma.brand.update({
    where: { id: brandId },
    data: {
      name: brand.name || legacy.displayName?.trim() || legacy.companyName?.trim() || brand.name,
      companyName: brand.companyName ?? legacy.companyName,
      companyDescription: brand.companyDescription ?? legacy.companyDescription,
      targetAudience: brand.targetAudience ?? legacy.targetAudience,
      tone: brand.tone || legacy.tone,
      primaryColor: brand.primaryColor || legacy.primaryColor,
      secondaryColor: brand.secondaryColor || legacy.secondaryColor,
      logoUrl: brand.logoUrl ?? legacy.logoUrl,
      guidelines: brand.guidelines ?? legacy.guidelines,
      brandStory: brand.brandStory ?? legacy.brandStory,
      onboardingComplete: brand.onboardingComplete || legacy.onboardingComplete,
    },
  });
}

/** Ensure at least one brand exists; migrate legacy BrandProfile into default brand. */
export async function ensureDefaultBrand(userId: string): Promise<BrandRecord> {
  const existing = await prisma.brand.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  if (existing) {
    await migrateLegacyBrandProfile(userId, existing.id);
    const refreshed = await prisma.brand.findUnique({ where: { id: existing.id } });
    return mapBrandRow(refreshed ?? existing);
  }

  const legacy = await prisma.brandProfile.findUnique({ where: { userId } });
  const name = legacy?.displayName?.trim() || legacy?.companyName?.trim() || "My brand";

  const brand = await prisma.brand.create({
    data: {
      userId,
      name,
      isDefault: true,
      companyName: legacy?.companyName,
      companyDescription: legacy?.companyDescription,
      targetAudience: legacy?.targetAudience,
      tone: legacy?.tone ?? DEFAULT_BRAND_PROFILE.tone,
      primaryColor: legacy?.primaryColor ?? DEFAULT_BRAND_PROFILE.primaryColor,
      secondaryColor: legacy?.secondaryColor ?? DEFAULT_BRAND_PROFILE.secondaryColor,
      logoUrl: legacy?.logoUrl,
      guidelines: legacy?.guidelines,
      brandStory: legacy?.brandStory,
      onboardingComplete: legacy?.onboardingComplete ?? false,
    },
  });

  return mapBrandRow(brand);
}

export async function listBrandsForUser(userId: string): Promise<BrandSummary[]> {
  await ensureDefaultBrand(userId);
  const rows = await prisma.brand.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isDefault: true,
      logoUrl: true,
      onboardingComplete: true,
    },
  });
  return rows;
}

export async function getActiveBrandId(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_BRAND_COOKIE)?.value;
  if (fromCookie) {
    const match = await prisma.brand.findFirst({
      where: { id: fromCookie, userId },
      select: { id: true },
    });
    if (match) return match.id;
  }

  const defaultBrand = await ensureDefaultBrand(userId);
  return defaultBrand.id;
}

export async function getActiveBrand(userId: string): Promise<BrandRecord> {
  const brandId = await getActiveBrandId(userId);
  const row = await prisma.brand.findFirst({
    where: { id: brandId, userId },
  });
  if (!row) return ensureDefaultBrand(userId);
  return mapBrandRow(row);
}

export async function setActiveBrand(userId: string, brandId: string) {
  const brand = await prisma.brand.findFirst({ where: { id: brandId, userId } });
  if (!brand) throw new Error("Brand not found");
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BRAND_COOKIE, brandId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  return mapBrandRow(brand);
}

export async function createBrand(userId: string, input: { name: string; description?: string }) {
  const name = input.name.trim();
  if (!name) throw new Error("Brand name is required");

  const count = await prisma.brand.count({ where: { userId } });
  if (count >= SOFT_BRAND_LIMIT) {
    throw new Error(`Brand limit reached (${SOFT_BRAND_LIMIT}). Remove a brand or contact us for more.`);
  }

  const brand = await prisma.brand.create({
    data: {
      userId,
      name,
      description: input.description?.trim() || null,
      isDefault: count === 0,
    },
  });

  await setActiveBrand(userId, brand.id);
  return mapBrandRow(brand);
}

export function brandContextFromRecord(brand: BrandRecord): string {
  const lines = [
    "Brand & company context:",
    `— Brand: ${brand.name}`,
    brand.tagline ? `— Tagline: ${brand.tagline}` : null,
    brand.language ? `— Language: ${brand.language}` : null,
    brand.targetAudience ? `— Target audience: ${brand.targetAudience}` : null,
    brand.brandValues ? `— Brand values: ${brand.brandValues}` : null,
    brand.brandAesthetic ? `— Brand aesthetic: ${brand.brandAesthetic}` : null,
    `— Primary color: ${brand.primaryColor}`,
    `— Secondary color: ${brand.secondaryColor}`,
    `— Tone of voice: ${brand.tone}`,
    brand.logoUrl ? `— Logo on file: preserve exact logo typography and colors when visible.` : null,
    brand.brandStory ? `— Brand story: ${brand.brandStory}` : null,
    brand.companyDescription ? `— Company positioning: ${brand.companyDescription}` : null,
    brand.guidelines ? `— Creative guidelines: ${brand.guidelines}` : null,
    "Every visual must use this brand palette and voice consistently.",
  ].filter(Boolean);

  return lines.join("\n");
}

export async function isActiveBrandOnboardingComplete(userId: string): Promise<boolean> {
  const brand = await getActiveBrand(userId);
  if (!brand.onboardingComplete) return false;
  return Boolean(brand.name?.trim() && brand.tone?.trim() && (brand.brandStory?.trim() || brand.tagline?.trim()));
}
