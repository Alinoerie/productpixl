export function isCheckoutEnabled() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  if (key.includes("placeholder")) return false;
  return key.startsWith("sk_");
}
