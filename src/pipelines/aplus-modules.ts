export type AplusModuleId =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8"
  | "M9"
  | "M10"
  | "M11"
  | "M12"
  | "M13"
  | "M14"
  | "M15";

export type AplusAspectRatio = "3:2" | "16:9" | "21:9";

export interface AplusModuleConfig {
  id: AplusModuleId;
  label: string;
  description: string;
  resolution: "2K" | "4K";
  targetWidth: number;
  targetHeight: number;
  aspectRatio: AplusAspectRatio;
  /** Center-crop height after width resize (970×300 modules). */
  cropHeight?: boolean;
  /** Premium A+ — requires brandRegistered. */
  premium?: boolean;
  /** Prefer composite workflow when human/scale in frame. */
  scaleCritical?: boolean;
}

/** Full Amazon A+ module library (M1–M15). */
export const APLUS_MODULE_LIBRARY: AplusModuleConfig[] = [
  {
    id: "M1",
    label: "Header with Text",
    description: "Brand hero — first impression, sets tone",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
  },
  {
    id: "M2",
    label: "Image + Text",
    description: "50/50 split — image left, text right",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 300,
    aspectRatio: "16:9",
    cropHeight: true,
  },
  {
    id: "M3",
    label: "Text + Image",
    description: "50/50 split — text left, image right",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 300,
    aspectRatio: "16:9",
    cropHeight: true,
    scaleCritical: true,
  },
  {
    id: "M4",
    label: "Image Grid",
    description: "3 or 4 column grid of cohesive vignettes",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
  },
  {
    id: "M5",
    label: "Product Showcase",
    description: "Multiple units in composed still-life",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
  },
  {
    id: "M6",
    label: "Comparison Chart",
    description: "Hero product vs alternatives",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
  },
  {
    id: "M7",
    label: "Large Image + Text",
    description: "Full-width atmospheric hero with text overlay zone",
    resolution: "4K",
    targetWidth: 1500,
    targetHeight: 600,
    aspectRatio: "21:9",
    scaleCritical: true,
  },
  {
    id: "M8",
    label: "Technical Specifications",
    description: "Clinical specs and label legibility",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 300,
    aspectRatio: "16:9",
    cropHeight: true,
  },
  {
    id: "M9",
    label: "Hotspot Image",
    description: "Clean product shot for feature callouts",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
  },
  {
    id: "M10",
    label: "Category Navigation",
    description: "Product in natural use environment with cross-sell context",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 300,
    aspectRatio: "16:9",
    cropHeight: true,
  },
  {
    id: "M11",
    label: "FAQ Module",
    description: "Trust visual backing FAQ answers",
    resolution: "2K",
    targetWidth: 970,
    targetHeight: 600,
    aspectRatio: "3:2",
    premium: true,
  },
  {
    id: "M12",
    label: "Video Module",
    description: "Static hero frame — most compelling action moment",
    resolution: "4K",
    targetWidth: 1500,
    targetHeight: 600,
    aspectRatio: "21:9",
    premium: true,
    scaleCritical: true,
  },
  {
    id: "M13",
    label: "Shoppable Image",
    description: "Rich lifestyle with hotspot focal points",
    resolution: "4K",
    targetWidth: 1500,
    targetHeight: 600,
    aspectRatio: "21:9",
    premium: true,
    scaleCritical: true,
  },
  {
    id: "M14",
    label: "A+ Card Carousel",
    description: "Horizontal story card — one chapter per generation",
    resolution: "4K",
    targetWidth: 1500,
    targetHeight: 600,
    aspectRatio: "21:9",
    premium: true,
  },
  {
    id: "M15",
    label: "Shoppable Lookbook",
    description: "Editorial cinematic spread",
    resolution: "4K",
    targetWidth: 1500,
    targetHeight: 600,
    aspectRatio: "21:9",
    premium: true,
    scaleCritical: true,
  },
];

export const DEFAULT_APLUS_MODULE_IDS: AplusModuleId[] = ["M1", "M2", "M4", "M7", "M9", "M11"];

export const MIN_APLUS_MODULES = 6;
export const MAX_APLUS_MODULES = 12;

export const SCALE_CRITICAL_APLUS_MODULES: AplusModuleId[] = ["M3", "M7", "M12", "M13", "M15"];

export const PREMIUM_APLUS_MODULES: AplusModuleId[] = ["M11", "M12", "M13", "M14", "M15"];

export function isAplusModuleScaleCritical(moduleId: AplusModuleId): boolean {
  return SCALE_CRITICAL_APLUS_MODULES.includes(moduleId);
}

export function isPremiumAplusModule(moduleId: AplusModuleId): boolean {
  return PREMIUM_APLUS_MODULES.includes(moduleId);
}

export function normalizeSelectedAplusModules(
  selectedModules?: AplusModuleId[] | null,
  brandRegistered?: boolean
): AplusModuleId[] {
  let ids: AplusModuleId[];
  if (selectedModules?.length) {
    const set = new Set<AplusModuleId>(["M1", ...selectedModules]);
    ids = APLUS_MODULE_LIBRARY.filter((m) => set.has(m.id)).map((m) => m.id);
  } else {
    ids = [...DEFAULT_APLUS_MODULE_IDS];
  }

  if (!brandRegistered) {
    ids = ids.filter((id) => !isPremiumAplusModule(id));
  }

  if (ids.length < MIN_APLUS_MODULES) {
    const extras = APLUS_MODULE_LIBRARY.filter((m) => !ids.includes(m.id) && (!m.premium || brandRegistered))
      .map((m) => m.id)
      .slice(0, MIN_APLUS_MODULES - ids.length);
    ids = [...ids, ...extras];
  }

  return ids.slice(0, MAX_APLUS_MODULES);
}

export function getModulesForRun(options?: {
  selectedModules?: AplusModuleId[];
  brandRegistered?: boolean;
}): AplusModuleConfig[] {
  const ids = normalizeSelectedAplusModules(options?.selectedModules, options?.brandRegistered);
  const idSet = new Set(ids);
  return APLUS_MODULE_LIBRARY.filter((m) => idSet.has(m.id));
}

export function getAplusModuleById(moduleId: AplusModuleId): AplusModuleConfig | undefined {
  return APLUS_MODULE_LIBRARY.find((m) => m.id === moduleId);
}
