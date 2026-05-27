export type ListingModuleId =
  | "L1"
  | "L2"
  | "L3"
  | "L4"
  | "L5"
  | "L6"
  | "L7"
  | "L8"
  | "L9"
  | "L10"
  | "L11"
  | "L12";

export interface ListingModuleConfig {
  id: ListingModuleId;
  label: string;
  description: string;
  resolution: "2K" | "4K";
  /** Off by default — user opts in (keeps starter runs affordable). */
  optional?: boolean;
}

/** Full PHOILA listing library (L1–L12). */
export const LISTING_MODULE_LIBRARY: ListingModuleConfig[] = [
  {
    id: "L1",
    label: "Main Hero",
    description: "Pure white background, product only — Amazon main image",
    resolution: "4K",
  },
  {
    id: "L2",
    label: "Size & Scale",
    description: "Size reference with familiar objects or measurements",
    resolution: "2K",
    optional: true,
  },
  {
    id: "L3",
    label: "Lifestyle In-Context",
    description: "Product in real use with aspirational context",
    resolution: "4K",
  },
  {
    id: "L4",
    label: "Texture & Detail",
    description: "Macro close-up of material and build quality",
    resolution: "2K",
  },
  {
    id: "L5",
    label: "Mood & Atmosphere",
    description: "Brand world and aspirational identity without forced product placement",
    resolution: "4K",
    optional: true,
  },
  {
    id: "L6",
    label: "Quality Construction",
    description: "Craftsmanship details — seams, lining, hardware, internals",
    resolution: "2K",
    optional: true,
  },
  {
    id: "L7",
    label: "Material Callout",
    description: "Composition, certifications, and ingredient story",
    resolution: "2K",
    optional: true,
  },
  {
    id: "L8",
    label: "Packaging & Unboxing",
    description: "What the customer receives at the door",
    resolution: "2K",
    optional: true,
  },
  {
    id: "L9",
    label: "Brand Story",
    description: "Origin, values, and provenance — who made this and why",
    resolution: "4K",
    optional: true,
  },
  {
    id: "L10",
    label: "Comparison / Versus",
    description: "Your product positioned against generic or competitor alternatives",
    resolution: "2K",
    optional: true,
  },
  {
    id: "L11",
    label: "Lifestyle Alternate",
    description: "Second lifestyle angle for a different buyer context",
    resolution: "4K",
    optional: true,
  },
  {
    id: "L12",
    label: "Lifestyle Action",
    description: "Product in active use — motion and value delivery moment",
    resolution: "4K",
    optional: true,
  },
];

/** Default starter run — same as original MVP. */
export const DEFAULT_LISTING_MODULE_IDS: ListingModuleId[] = ["L1", "L3", "L4"];

/** @deprecated use LISTING_MODULE_LIBRARY */
export const MVP_LISTING_MODULES = LISTING_MODULE_LIBRARY;

export function normalizeSelectedModules(
  selectedModules?: ListingModuleId[] | null,
  includePackaging?: boolean
): ListingModuleId[] {
  if (selectedModules?.length) {
    const ids = new Set<ListingModuleId>(["L1", ...selectedModules]);
    return LISTING_MODULE_LIBRARY.filter((m) => ids.has(m.id)).map((m) => m.id);
  }
  const ids = new Set<ListingModuleId>(DEFAULT_LISTING_MODULE_IDS);
  if (includePackaging) ids.add("L8");
  return LISTING_MODULE_LIBRARY.filter((m) => ids.has(m.id)).map((m) => m.id);
}

export function getModulesForRun(options?: {
  includePackaging?: boolean;
  selectedModules?: ListingModuleId[];
}): ListingModuleConfig[] {
  const ids = normalizeSelectedModules(options?.selectedModules, options?.includePackaging);
  const idSet = new Set(ids);
  return LISTING_MODULE_LIBRARY.filter((m) => idSet.has(m.id));
}

export function getModuleById(moduleId: ListingModuleId): ListingModuleConfig | undefined {
  return LISTING_MODULE_LIBRARY.find((m) => m.id === moduleId);
}

/** PHOILA scale-critical listing modules — prefer composite workflow. */
export const SCALE_CRITICAL_LISTING_MODULES: ListingModuleId[] = ["L2", "L3", "L11", "L12"];

export function isListingModuleScaleCritical(moduleId: ListingModuleId): boolean {
  return SCALE_CRITICAL_LISTING_MODULES.includes(moduleId);
}
