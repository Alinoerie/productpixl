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
import { formatOrderStatus } from "@/lib/status-labels";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { getAccountJourney } from "@/lib/user-journey";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

function formatAmount(cents: number) {
  return new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }).format(cents / 100);
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
                <Button asChild variant="outline">
                  <Link href={STUDIO_ROUTES.images}>Use free credits</Link>
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
                  <Badge variant="secondary">{formatOrderStatus(o.status)}</Badge>
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
