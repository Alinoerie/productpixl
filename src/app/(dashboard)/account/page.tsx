import Link from "next/link";
import { Suspense } from "react";
import { CreditCard, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { CreditUsageGuide } from "@/components/account/credit-usage-guide";
import { EmailConfigBanner } from "@/components/account/email-config-banner";
import { SignOutButton } from "@/components/account/sign-out-button";
import { NotificationPrefsCard } from "@/components/account/notification-prefs-card";
import { ExportDataSection } from "@/components/account/export-data-section";
import { formatOrderStatus } from "@/lib/status-labels";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { getAccountJourney } from "@/lib/user-journey";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

function formatAmount(cents: number, currency = "EUR") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  const credits = user?.credits ?? 0;
  const journey = getAccountJourney(credits);
  const notificationPrefs = (user?.notificationPrefs as {
    emailOnGenerationComplete: boolean;
    emailOnLowCredits: boolean;
    marketingUpdates: boolean;
    weeklyDigest: boolean;
  }) ?? {
    emailOnGenerationComplete: true,
    emailOnLowCredits: true,
    marketingUpdates: false,
    weeklyDigest: false,
  };

  return (
    <StudioPageShell
      eyebrow="Account"
      title={session.user.name ?? "Account"}
      description={session.user.email ?? undefined}
      guide={journey}
    >
      <EmailConfigBanner />

      {params.success ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
      ) : null}

      {params.canceled ? (
        <p
          className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]"
          role="alert"
        >
          Checkout canceled — no charges were made.{" "}
          <Link href="/pricing" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Try again
          </Link>
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={credits < 2 ? "border-[var(--warning-border)] bg-[var(--warning-bg)]/30" : "border-[var(--accent)]/20 bg-[var(--accent-soft)]/30"}>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Balance</p>
              <p className="mt-1 font-serif text-4xl">{credits}</p>
              <p className="text-sm text-[var(--muted-fg)]">
                {credits < 2 ? "Top up before your next run" : "generation credits remaining"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--muted-fg)]">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Powered by Stripe
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Secure checkout
              </span>
            </div>
            <Button asChild>
              <Link href="/pricing">Buy credits</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full flex-col justify-center gap-3 p-6">
            <p className="text-sm font-medium">Quick links</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={STUDIO_ROUTES.projects}>All projects</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={STUDIO_ROUTES.images}>Images</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={STUDIO_ROUTES.copy}>Copy</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={STUDIO_ROUTES.brandProfile}>Brand kit</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreditUsageGuide />

      <div className="grid gap-4 md:grid-cols-2">
        <NotificationPrefsCard initialPrefs={notificationPrefs} />
        <ExportDataSection />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!user?.orders?.length ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]/60">
                <Receipt className="h-7 w-7 text-[var(--muted-fg)]" strokeWidth={1.5} />
              </div>
              <p className="mt-4 font-serif text-lg">No purchases yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted-fg)]">
                You started with 10 free credits. When you buy a Starter or Growth pack, receipts appear here with
                status and credit totals.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link href="/pricing">
                    <CreditCard className="h-4 w-4" />
                    View credit packs
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {user.orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{o.package} pack · {o.credits} credits</p>
                    <p className="text-xs text-[var(--muted-fg)]">
                      {new Date(o.createdAt).toLocaleDateString()} · {formatAmount(o.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/api/invoices/${o.id}`} target="_blank">
                        Download invoice
                      </Link>
                    </Button>
                    <Badge variant="secondary">{formatOrderStatus(o.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div>
          <p className="text-sm font-medium">Session</p>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            Signed in as {session.user.email ?? "your account"}. Sign out to switch accounts on this device.
          </p>
        </div>
        <SignOutButton />
      </div>
    </StudioPageShell>
  );
}
