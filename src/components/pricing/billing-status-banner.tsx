import { Badge } from "@/components/ui/badge";
import { getCheckoutReadiness } from "@/lib/checkout";

export function BillingStatusBanner({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const { webhookConfigured, creditsFulfillmentReady } = getCheckoutReadiness();

  if (creditsFulfillmentReady) {
    return (
      <div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)]/40 px-4 py-4 text-sm">
        <p className="font-medium text-[var(--foreground)]">Credit packs available</p>
        <p className="mt-1 text-[var(--muted-fg)]">
          Secure checkout via Stripe. Credits are added to your balance immediately after payment.
        </p>
      </div>
    );
  }

  if (checkoutEnabled && !webhookConfigured) {
    return (
      <div
        className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)]/50 px-4 py-4 text-sm"
        role="status"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-[var(--warning-border)] text-[var(--warning)]">
            Almost live
          </Badge>
          <p className="font-medium text-[var(--foreground)]">Stripe connected — webhook pending</p>
        </div>
        <p className="mt-2 text-[var(--muted-fg)]">
          Pack prices are ready. Purchases open once the payment webhook is connected on our side.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)]/50 px-4 py-4 text-sm"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-[var(--warning-border)] text-[var(--warning)]">
          Billing preview
        </Badge>
        <p className="font-medium text-[var(--foreground)]">Generation works today — purchases open soon</p>
      </div>
      <p className="mt-2 text-[var(--muted-fg)]">
        Use your signup credits in the studio now. Pack prices below are for reference until Stripe checkout
        launches. Monthly subscriptions are planned separately and are not billed yet.
      </p>
    </div>
  );
}
