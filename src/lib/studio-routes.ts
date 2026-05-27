/** Canonical studio routes — use these instead of legacy paths. */
export const STUDIO_ROUTES = {
  home: "/studio",
  images: "/studio/images",
  aplus: "/studio/aplus",
  copy: "/studio/copy",
  video: "/studio/video",
  brandProfile: "/brand",
  brandsList: "/brands",
  /** @deprecated Same data as projects — use projectsHref() */
  products: "/products",
  projects: "/projects",
  playbooks: "/playbooks",
  myPlaybooks: "/my-playbooks",
  templates: "/templates",
  pricing: "/pricing",
  account: "/account",
} as const;

/** @deprecated Use STUDIO_ROUTES.brandProfile */
export const LEGACY_STUDIO_HOME = "/dashboard";

export function studioImagesHref(query?: { productId?: string | null; template?: string }) {
  if (!query?.productId && !query?.template) return STUDIO_ROUTES.images;
  const params = new URLSearchParams();
  if (query.productId) params.set("productId", query.productId);
  if (query.template) params.set("template", query.template);
  return `${STUDIO_ROUTES.images}?${params.toString()}`;
}

export function studioAplusHref(query?: { productId?: string | null; template?: string }) {
  if (!query?.productId && !query?.template) return STUDIO_ROUTES.aplus;
  const params = new URLSearchParams();
  if (query.productId) params.set("productId", query.productId);
  if (query.template) params.set("template", query.template);
  return `${STUDIO_ROUTES.aplus}?${params.toString()}`;
}

export function studioCopyHref(productId?: string) {
  if (!productId) return STUDIO_ROUTES.copy;
  return `${STUDIO_ROUTES.copy}?productId=${encodeURIComponent(productId)}`;
}

export function projectsHref(query?: {
  brandId?: string | null;
  status?: string;
  copy?: string;
  images?: string;
  ready?: string;
  q?: string;
  page?: string;
}) {
  if (!query) return STUDIO_ROUTES.projects;
  const params = new URLSearchParams();
  if (query.brandId) params.set("brandId", query.brandId);
  if (query.status) params.set("status", query.status);
  if (query.copy) params.set("copy", query.copy);
  if (query.images) params.set("images", query.images);
  if (query.ready) params.set("ready", query.ready);
  if (query.q) params.set("q", query.q);
  if (query.page && query.page !== "1") params.set("page", query.page);
  const s = params.toString();
  return s ? `${STUDIO_ROUTES.projects}?${s}` : STUDIO_ROUTES.projects;
}

export const CONTENT_STUDIO_TABS = [
  { href: STUDIO_ROUTES.home, label: "Overview", match: (path: string) => path === STUDIO_ROUTES.home },
  {
    href: STUDIO_ROUTES.images,
    label: "Images",
    match: (path: string) => path.startsWith(STUDIO_ROUTES.images),
  },
  {
    href: STUDIO_ROUTES.aplus,
    label: "A+",
    match: (path: string) => path.startsWith(STUDIO_ROUTES.aplus),
  },
  {
    href: STUDIO_ROUTES.copy,
    label: "Copy",
    match: (path: string) => path.startsWith(STUDIO_ROUTES.copy),
  },
  {
    href: STUDIO_ROUTES.video,
    label: "Video",
    badge: "Beta",
    match: (path: string) => path.startsWith(STUDIO_ROUTES.video),
  },
] as const;
