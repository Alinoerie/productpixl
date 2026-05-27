import { create } from "zustand";
import { DEFAULT_BRAND_PROFILE, type BrandProfileData } from "@/lib/brand-profile-types";

export type BrandStoreProfile = BrandProfileData & {
  language?: string;
  tagline?: string | null;
  brandId?: string;
  brandName?: string;
};

type BrandState = {
  profile: BrandStoreProfile;
  loaded: boolean;
  setProfile: (profile: Partial<BrandStoreProfile>) => void;
  hydrate: () => Promise<void>;
};

export const useBrandStore = create<BrandState>((set, get) => ({
  profile: {
    ...DEFAULT_BRAND_PROFILE,
    language: "en",
  },
  loaded: false,
  setProfile: (patch) =>
    set((s) => ({
      profile: { ...s.profile, ...patch },
    })),
  hydrate: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/brand-profile");
      if (!res.ok) return;
      const data = (await res.json()) as { profile: BrandStoreProfile };
      set({
        loaded: true,
        profile: {
          ...DEFAULT_BRAND_PROFILE,
          ...data.profile,
          displayName: data.profile.displayName ?? data.profile.brandName ?? "",
          language: data.profile.language ?? "en",
        },
      });
    } catch {
      set({ loaded: true });
    }
  },
}));
