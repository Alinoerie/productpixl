import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PricingBalance } from "@/components/pricing/pricing-balance";
import { PricingCatalog } from "@/components/pricing/pricing-catalog";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { isCheckoutEnabled } from "@/lib/checkout";

export const metadata = {
  title: "Credits & pricing — ProductPixl",
  description: "Pay per generation — no subscription. Compare vs Pixii and buy credit packs when you need more.",
};

function PricingContent({
  signedIn,
  credits,
  checkoutEnabled,
  canceled,
  success,
}: {
  signedIn: boolean;
  credits: number;
  checkoutEnabled: boolean;
  canceled?: string;
  success?: string;
}) {
  return (
    <div className="space-y-12">
      {!signedIn ? (
        <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-4 text-sm md:flex md:items-center md:justify-between md:gap-4">
          <p>
            <strong>10 free credits</strong> on signup — enough for image runs and listing copy. Sign in to buy
            packs or use your balance in the studio.
          </p>
          <Button asChild className="mt-3 shrink-0 md:mt-0">
            <Link href="/login?callbackUrl=/pricing">Sign in free</Link>
          </Button>
        </div>
      ) : null}
      {signedIn ? <PricingBalance initialCredits={credits} /> : null}
      {success ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
      ) : null}
      {canceled ? (
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

      <PricingCatalog initialCredits={signedIn ? credits : 0} checkoutEnabled={checkoutEnabled} signedIn={signedIn} />

      <PricingComparison checkoutEnabled={checkoutEnabled} />
    </div>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; success?: string }>;
}) {
  const params = await searchParams;
  const checkoutEnabled = isCheckoutEnabled();
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const credits =
    session?.user?.id != null
      ? ((await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }))?.credits ?? 0)
      : 0;

  if (signedIn) {
    return (
      <StudioProviders>
        <AppShell>
          <PricingContent
            signedIn
            credits={credits}
            checkoutEnabled={checkoutEnabled}
            canceled={params.canceled}
            success={params.success}
          />
        </AppShell>
      </StudioProviders>
    );
  }

  return (
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <PricingContent
          signedIn={false}
          credits={0}
          checkoutEnabled={checkoutEnabled}
          canceled={params.canceled}
          success={params.success}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
