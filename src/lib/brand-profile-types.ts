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
  language?: string;
  tagline?: string | null;
  brandValues?: string | null;
  brandAesthetic?: string | null;
}

export const DEFAULT_BRAND_PROFILE: BrandProfileData = {
  companyName: null,
  companyDescription: null,
  targetAudience: null,
  displayName: null,
  primaryColor: "#6366F1",
  secondaryColor: "#0891B2",
  tone: "premium, trustworthy, conversion-focused, no hype",
  logoUrl: null,
  guidelines: null,
  brandStory: null,
  onboardingComplete: false,
  language: "en",
  tagline: null,
  brandValues: null,
  brandAesthetic: null,
};
