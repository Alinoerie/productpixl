/** Routes always reachable with 0 credits (account, brand, billing). */
export const CREDIT_EXEMPT_PATH_PREFIXES = [
  "/onboarding",
  "/brand",
  "/account",
  "/pricing",
] as const;

/** Paid studio routes — redirect to pricing when balance is 0. */
export const CREDIT_LOCKED_PATH_PREFIXES = ["/generate", "/copy"] as const;

export function hasPaidCredits(credits: number): boolean {
  return credits >= 1;
}

export function isCreditExemptPath(pathname: string): boolean {
  return CREDIT_EXEMPT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isCreditLockedPath(pathname: string): boolean {
  return CREDIT_LOCKED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function pricingPaywallUrl(reason: "locked" | "low" = "locked"): string {
  return reason === "locked" ? "/pricing?locked=1" : "/pricing";
}
