export type ShowcaseModuleId = "L1" | "L3" | "L4" | "L5" | "L6" | "L8";

export type ShowcaseModule = {
  moduleId: ShowcaseModuleId;
  label: string;
  image: string;
  alt: string;
  caption: string;
};

export type ShowcaseCaseStudy = {
  id: string;
  product: string;
  category: string;
  marketplace: string;
  /** Original upload — shown as “before” when present */
  source?: { image: string; alt: string; caption: string };
  modules: ShowcaseModule[];
};

/** Real showcase outputs copied from local generation runs */
export const SHOWCASE_CASE_STUDIES: ShowcaseCaseStudy[] = [
  {
    id: "zealots",
    product: "Zealots Hand Soap",
    category: "Beauty & personal care",
    marketplace: "Amazon US · Bol.com",
    source: {
      image: "/showcase/zealots/source.jpg",
      alt: "Original phone photo of Zealots energizing hand soap bottle",
      caption: "Seller upload — single product photo",
    },
    modules: [
      {
        moduleId: "L1",
        label: "Hero",
        image: "/showcase/zealots/l1-hero.jpg",
        alt: "White-background hero image of hand soap bottle",
        caption: "L1 · Amazon-compliant 1:1 hero",
      },
      {
        moduleId: "L3",
        label: "Lifestyle",
        image: "/showcase/zealots/l3-lifestyle.jpg",
        alt: "Hand soap on marble counter with eucalyptus",
        caption: "L3 · In-use bathroom scene",
      },
      {
        moduleId: "L4",
        label: "Detail",
        image: "/showcase/zealots/l4-detail.jpg",
        alt: "Macro detail of copper label on hand soap",
        caption: "L4 · Label & material fidelity",
      },
      {
        moduleId: "L5",
        label: "Flat lay",
        image: "/showcase/zealots/l5-flatlay.jpg",
        alt: "Flat lay of hand soap with botanical props",
        caption: "L5 · Ingredients story flat lay",
      },
      {
        moduleId: "L6",
        label: "Context",
        image: "/showcase/zealots/l6-context.jpg",
        alt: "Hand soap in spa-like setting",
        caption: "L6 · Category context shot",
      },
    ],
  },
  {
    id: "skincare",
    product: "Serum Dropper",
    category: "Skincare",
    marketplace: "Amazon US · EU",
    modules: [
      {
        moduleId: "L1",
        label: "Hero",
        image: "/showcase/skincare/l1-hero.jpg",
        alt: "Premium serum dropper bottle hero on stone surface",
        caption: "L1 · Luxury hero with warm light",
      },
      {
        moduleId: "L3",
        label: "Lifestyle",
        image: "/showcase/skincare/l3-lifestyle.jpg",
        alt: "Serum bottle in minimalist vanity scene",
        caption: "L3 · Morning routine lifestyle",
      },
      {
        moduleId: "L4",
        label: "Detail",
        image: "/showcase/skincare/l4-detail.jpg",
        alt: "Close-up of dropper and fragrance notes",
        caption: "L4 · Texture & finish macro",
      },
      {
        moduleId: "L5",
        label: "Flat lay",
        image: "/showcase/skincare/l5-flatlay.jpg",
        alt: "Bamboo and botanical flat lay with serum",
        caption: "L5 · Natural ingredients flat lay",
      },
    ],
  },
  {
    id: "chair",
    product: "Danish Lounge Chair",
    category: "Home & furniture",
    marketplace: "Amazon DE · UK",
    modules: [
      {
        moduleId: "L1",
        label: "Hero",
        image: "/showcase/chair/l1-hero.jpg",
        alt: "Scandinavian lounge chair on white background",
        caption: "L1 · Clean furniture hero",
      },
      {
        moduleId: "L3",
        label: "Lifestyle",
        image: "/showcase/chair/l3-lifestyle.jpg",
        alt: "Chair in bright Scandinavian living room",
        caption: "L3 · Room-scale lifestyle",
      },
      {
        moduleId: "L4",
        label: "Detail",
        image: "/showcase/chair/l4-detail.jpg",
        alt: "Upholstery and wood joinery detail",
        caption: "L4 · Craft & materials close-up",
      },
    ],
  },
];

/** Curated mosaic for hero + login panel */
export const SHOWCASE_HERO_MOSAIC = [
  { image: "/showcase/zealots/l3-lifestyle.jpg", alt: "Hand soap lifestyle scene" },
  { image: "/showcase/skincare/l1-hero.jpg", alt: "Skincare hero shot" },
  { image: "/showcase/chair/l3-lifestyle.jpg", alt: "Chair in living room" },
  { image: "/showcase/zealots/l1-hero.jpg", alt: "Hand soap white background hero" },
];

/** One best image per listing module for the outputs section */
export const SHOWCASE_MODULE_SAMPLES: Record<
  ShowcaseModuleId,
  { image: string; alt: string; product: string }
> = {
  L1: {
    image: "/showcase/zealots/l1-hero.jpg",
    alt: "White background product hero",
    product: "Zealots Hand Soap",
  },
  L3: {
    image: "/showcase/zealots/l3-lifestyle.jpg",
    alt: "In-context lifestyle product shot",
    product: "Zealots Hand Soap",
  },
  L4: {
    image: "/showcase/skincare/l4-detail.jpg",
    alt: "Macro product detail",
    product: "Serum Dropper",
  },
  L5: {
    image: "/showcase/zealots/l5-flatlay.jpg",
    alt: "Flat lay with props",
    product: "Zealots Hand Soap",
  },
  L6: {
    image: "/showcase/zealots/l6-context.jpg",
    alt: "Category context scene",
    product: "Zealots Hand Soap",
  },
  L8: {
    image: "/showcase/skincare/l3-lifestyle.jpg",
    alt: "Packaging and unboxing style shot",
    product: "Serum Dropper",
  },
};

export const PRIMARY_CASE_STUDY = SHOWCASE_CASE_STUDIES[0];
