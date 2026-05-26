function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
}

/** True when Stripe Checkout sessions can be created (secret key configured). */
export function isCheckoutEnabled() {
  const key = stripeSecretKey();
  if (!key || key.includes("placeholder")) return false;
  return key.startsWith("sk_");
}

/** True when webhook can verify payments and grant credits. */
export function isStripeWebhookConfigured() {
  const secret = stripeWebhookSecret();
  return Boolean(secret && secret.startsWith("whsec_") && !secret.includes("placeholder"));
}

/** Dashboard Price IDs — optional; falls back to inline price_data when unset. */
export function hasStripePriceIds() {
  const starter = process.env.STRIPE_PRICE_STARTER?.trim();
  const growth = process.env.STRIPE_PRICE_GROWTH?.trim();
  return Boolean(starter?.startsWith("price_") && growth?.startsWith("price_"));
}

/** Checkout + webhook — safe to sell credit packs. */
export function isCheckoutLive() {
  return isCheckoutEnabled() && isStripeWebhookConfigured();
}

/** Full billing readiness for ops / readiness scripts. */
export function getCheckoutReadiness() {
  const checkoutEnabled = isCheckoutEnabled();
  return {
    checkoutEnabled,
    webhookConfigured: isStripeWebhookConfigured(),
    hasPriceIds: hasStripePriceIds(),
    creditsFulfillmentReady: isCheckoutLive(),
  };
}
