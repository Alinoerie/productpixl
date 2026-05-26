export type ListingModuleId = "L1" | "L3" | "L4" | "L8";

export interface ListingModuleConfig {
  id: ListingModuleId;
  label: string;
  description: string;
  resolution: "2K" | "4K";
  optional?: boolean;
}

/** MVP fast path — full L1–L12 module library in a later phase */
export const MVP_LISTING_MODULES: ListingModuleConfig[] = [
  {
    id: "L1",
    label: "Main Hero",
    description: "Pure white background, product only — Amazon main image",
    resolution: "4K",
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
    id: "L8",
    label: "Packaging & Unboxing",
    description: "What the customer receives at the door",
    resolution: "2K",
    optional: true,
  },
];

export function getModulesForRun(includePackaging: boolean): ListingModuleConfig[] {
  return MVP_LISTING_MODULES.filter((m) => !m.optional || includePackaging);
}
