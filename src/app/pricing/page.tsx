import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { Button } from "@/components/ui/button";
import { PricingBalance } from "@/components/pricing/pricing-balance";
import { PricingCatalog } from "@/components/pricing/pricing-catalog";
import { PricingPlanCards } from "@/components/pricing/pricing-plan-cards";
import { PricingPlanComparison } from "@/components/pricing/pricing-plan-comparison";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { CreditsLockedNotice } from "@/components/pricing/credits-locked-notice";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { BillingStatusBanner } from "@/components/pricing/billing-status-banner";
import { HowCreditsWork } from "@/components/pricing/how-credits-work";
import { isCheckoutLive } from "@/lib/checkout";
import { PRICING_VAT_NOTE } from "@/lib/pricing-plans";
import { USP_ONE_LINER, USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";

export const metadata: Metadata = {
  title: "Pricing — ProductPixl",
  description: `${USP_ONE_LINER} Free signup, Starter & Catalog packs in EUR.`,
  openGraph: {
    title: "Pricing — ProductPixl",
    description: "Free tier, Starter & Catalog packs, and monthly plans preview — all in credits.",
    url: "/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — ProductPixl",
    description: "Simple plans for every catalog size. Credits for image and copy studio runs.",
  },
};

function PricingHero() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{USP_TAGLINE}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Simple plans for every catalog size</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">
        {USP_SUBHEAD.split(". ").slice(0, 2).join(". ")}. Credits — not a monthly listing cap — with packs when you
        need more.
      </p>
      <p className="mt-3 text-xs text-[var(--muted-fg)]">{PRICING_VAT_NOTE}</p>
    </header>
  );
}

function PricingContent({
  signedIn,
  credits,
  checkoutEnabled,
  canceled,
  success,
  locked,
}: {
  signedIn: boolean;
  credits: number;
  checkoutEnabled: boolean;
  canceled?: string;
  success?: string;
  locked?: boolean;
}) {
  return (
    <div className="space-y-16">
      <PricingHero />

      {locked && signedIn ? <CreditsLockedNotice /> : null}

      <BillingStatusBanner checkoutEnabled={checkoutEnabled} />

      {!signedIn ? (
        <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-4 text-sm md:flex md:items-center md:justify-between md:gap-4">
          <p>
            <strong>10 free credits</strong> on signup — no credit card. Sign in to see your balance and buy packs.
          </p>
          <Button asChild className="mt-3 shrink-0 rounded-xl md:mt-0">
            <Link href="/login?callbackUrl=/pricing">Start free</Link>
          </Button>
        </div>
      ) : (
        <PricingBalance initialCredits={credits} />
      )}

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
            Try again
          </Link>
        </div>
      ) : null}

      <HowCreditsWork />

      <PricingPlanCards signedIn={signedIn} checkoutEnabled={checkoutEnabled} />

      <PricingPlanComparison />

      <PricingCatalog initialCredits={signedIn ? credits : 0} checkoutEnabled={checkoutEnabled} signedIn={signedIn} />

      <PricingFaq />

      <PricingComparison />

      <section className="rounded-2xl bg-[var(--ink)] px-6 py-10 text-center text-white md:px-12 md:py-14">
        <h2 className="font-serif text-2xl md:text-3xl">Launch before you list</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/70">
          Start with 10 free credits or book a demo — one photo to gallery, copy, and marketplace export.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href={signedIn ? "/studio" : "/login?callbackUrl=/studio"}>
              {signedIn ? "Open studio" : "Start free"}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/demo">Book a demo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; success?: string; locked?: string }>;
}) {
  const params = await searchParams;
  const checkoutEnabled = isCheckoutLive();
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const credits =
    session?.user?.id != null
      ? ((await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }))?.credits ?? 0)
      : 0;

  if (signedIn) {
    return (
      <StudioProviders>
        <AppShell credits={credits} showPaywallBanner={false}>
          <PricingContent
            signedIn
            credits={credits}
            checkoutEnabled={checkoutEnabled}
            canceled={params.canceled}
            success={params.success}
            locked={params.locked === "1"}
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
