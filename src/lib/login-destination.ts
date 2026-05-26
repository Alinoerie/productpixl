export function loginDestinationLabel(callbackUrl: string) {
  if (callbackUrl === "/dashboard") return "your studio dashboard";
  if (callbackUrl.startsWith("/generate")) return "Image studio";
  if (callbackUrl.startsWith("/copy")) return "Listing copy studio";
  if (callbackUrl.startsWith("/pricing")) return "Credits & billing";
  if (callbackUrl.startsWith("/products/")) return "your project";
  if (callbackUrl.startsWith("/projects")) return "All projects";
  if (callbackUrl.startsWith("/brand")) return "Brand profile";
  if (callbackUrl.startsWith("/account")) return "Your account";
  if (callbackUrl.startsWith("/grader")) return "Listing grader";
  return "where you left off";
}
