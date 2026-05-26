import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
});

export const CREDIT_PACKAGES = {
  starter: { credits: 10, amount: 2900, label: "Starter" },
  growth: { credits: 30, amount: 7900, label: "Growth" },
} as const;

export type CreditPackageKey = keyof typeof CREDIT_PACKAGES;

export async function createCheckoutSession(
  userId: string,
  email: string,
  packageKey: CreditPackageKey,
  returnTo = "/generate"
) {
  const pkg = CREDIT_PACKAGES[packageKey];
  const priceId =
    packageKey === "starter"
      ? process.env.STRIPE_PRICE_STARTER
      : process.env.STRIPE_PRICE_GROWTH;

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const safeReturn =
    returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo.split("?")[0] : "/generate";
  const successUrl = `${baseUrl}${safeReturn}?success=true`;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: "eur",
            unit_amount: pkg.amount,
            product_data: {
              name: `ProductPixl ${pkg.label} — ${pkg.credits} credits`,
              description: `${pkg.credits} generation credits for ProductPixl`,
            },
          },
          quantity: 1,
        },
      ];

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    metadata: {
      userId,
      package: packageKey,
      credits: String(pkg.credits),
    },
    success_url: successUrl,
    cancel_url: `${baseUrl}/pricing?canceled=true`,
  });
}
