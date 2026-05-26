import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { PricingBalance } from "@/components/pricing/pricing-balance";
import { PricingCatalog } from "@/components/pricing/pricing-catalog";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { isCheckoutEnabled } from "@/lib/checkout";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; success?: string }>;
}) {
  const params = await searchParams;
  const checkoutEnabled = isCheckoutEnabled();
  const session = await auth();
  const credits =
    session?.user?.id != null
      ? ((await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }))?.credits ?? 0)
      : 0;

  return (
    <div className="space-y-12">
      {session?.user?.id ? <PricingBalance initialCredits={credits} /> : null}
      {params.success ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
      ) : null}
      {params.canceled ? (
        <div
          className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]"
          role="alert"
        >
          Checkout canceled — no charges were made.{" "}
          <Link href="/pricing" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Pick a pack and try again
          </Link>
        </div>
      ) : null}
      <PageHeader
        title="Credits that scale with your catalog"
        description="No $207/mo subscription like Pixii. One credit = one full image pipeline (L1 + L3 + L4) or one listing copy run. Buy when you need more — credits do not expire on a monthly clock."
      >
        <Badge variant="outline" className="border-[var(--accent)]/30 text-[var(--accent)]">
          Pay per generation
        </Badge>
      </PageHeader>

      {session?.user?.id ? (
        <PricingCatalog initialCredits={credits} checkoutEnabled={checkoutEnabled} />
      ) : (
        <PricingCatalog initialCredits={0} checkoutEnabled={checkoutEnabled} />
      )}

      <PricingComparison checkoutEnabled={checkoutEnabled} />
    </div>
  );
}
