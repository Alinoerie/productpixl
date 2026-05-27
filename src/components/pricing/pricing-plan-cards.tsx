"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { PRICING_PLAN_COLUMNS, type PricingPlanColumn } from "@/lib/pricing-plans";
import { cn } from "@/lib/utils";

function PlanCta({
  plan,
  signedIn,
  checkoutEnabled,
}: {
  plan: PricingPlanColumn;
  signedIn: boolean;
  checkoutEnabled: boolean;
}) {
  if (plan.comingSoon) {
    if (plan.ctaHref) {
      return (
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
        </Button>
      );
    }
    return (
      <Button className="w-full rounded-xl" disabled aria-disabled>
        {plan.ctaLabel}
      </Button>
    );
  }

  if (plan.stripePackKey) {
    if (!signedIn) {
      return (
        <Button asChild className="w-full rounded-xl">
          <Link href="/login?callbackUrl=/pricing">{plan.ctaLabel}</Link>
        </Button>
      );
    }
    return (
      <CheckoutButton
        packageKey={plan.stripePackKey}
        label={checkoutEnabled ? plan.ctaLabel : "Payments coming soon"}
        checkoutEnabled={checkoutEnabled}
      />
    );
  }

  return (
    <Button asChild className="w-full rounded-xl">
      <Link href={plan.ctaHref ?? "/login?callbackUrl=/pricing"}>{plan.ctaLabel}</Link>
    </Button>
  );
}

export function PricingPlanCards({
  signedIn,
  checkoutEnabled,
}: {
  signedIn: boolean;
  checkoutEnabled: boolean;
}) {
  return (
    <section aria-labelledby="plans-heading" data-m-scroll className="space-y-6">
      <div className="text-center md:text-left">
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
      </div>
      <div data-m-stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRICING_PLAN_COLUMNS.map((plan) => (
          <Card
            key={plan.id}
            data-m-item
            className={cn(
              "relative flex flex-col",
              plan.popular && "border-[var(--accent)] shadow-[var(--shadow-md)] ring-2 ring-[var(--accent)]/25",
              plan.comingSoon && "border-dashed opacity-95"
            )}
          >
            {plan.popular ? (
              <Badge className="absolute -top-2.5 left-4 bg-[var(--accent)]">Most popular</Badge>
            ) : plan.comingSoon && plan.id !== "enterprise" ? (
              <Badge variant="outline" className="absolute -top-2.5 left-4 border-[var(--muted-fg)]/30">
                Coming soon
              </Badge>
            ) : null}
            <CardHeader className={plan.popular || plan.comingSoon ? "pt-8" : undefined}>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-[var(--muted-fg)]">{plan.tagline}</p>
              <p className="font-serif text-4xl tracking-tight">
                {plan.price}
                {plan.priceSuffix ? (
                  <span className="text-base font-sans text-[var(--muted-fg)]">{plan.priceSuffix}</span>
                ) : null}
              </p>
              <p className="text-sm font-medium text-[var(--accent)]">{plan.creditsLabel}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="space-y-2 text-sm">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <PlanCta plan={plan} signedIn={signedIn} checkoutEnabled={checkoutEnabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--muted-fg)] md:text-left">
        * Listing run counts are indicative and depend on gallery modules, marketplace, and product intake depth.
      </p>
    </section>
  );
}
