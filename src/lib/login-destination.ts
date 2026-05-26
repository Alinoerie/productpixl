import { STUDIO_ROUTES, studioCopyHref, studioImagesHref } from "@/lib/studio-routes";

export function loginDestinationLabel(callbackUrl: string) {
  if (callbackUrl === STUDIO_ROUTES.home || callbackUrl === "/dashboard") return "Content studio";
  if (callbackUrl.startsWith(STUDIO_ROUTES.images) || callbackUrl.startsWith("/generate")) return "Images";
  if (callbackUrl.startsWith(STUDIO_ROUTES.copy) || callbackUrl.startsWith("/copy")) return "Copy";
  if (callbackUrl.startsWith(STUDIO_ROUTES.pricing)) return "Credits & billing";
  if (callbackUrl.startsWith("/products/")) return "your project";
  if (callbackUrl.startsWith(STUDIO_ROUTES.projects)) return "All projects";
  if (callbackUrl.startsWith(STUDIO_ROUTES.brandProfile)) return "Brand profile";
  if (callbackUrl.startsWith(STUDIO_ROUTES.account)) return "Your account";
  if (callbackUrl.startsWith("/grader")) return "Listing grader";
  return "where you left off";
}

export { studioCopyHref, studioImagesHref };
