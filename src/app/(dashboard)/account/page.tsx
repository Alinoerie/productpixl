import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { formatOrderStatus } from "@/lib/status-labels";

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title={session.user.name ?? "Account"}
        description={session.user.email ?? undefined}
      />

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
        <Card className="border-[var(--accent)]/20 bg-[var(--accent-soft)]/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Balance</p>
              <p className="mt-1 font-serif text-4xl">{credits}</p>
              <p className="text-sm text-[var(--muted-fg)]">generation credits</p>
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
                <Link href="/generate">Image studio</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/copy">Listing copy</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/brand">Brand profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!user?.orders?.length ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
              <p className="text-sm text-[var(--muted-fg)]">No purchases yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/pricing">View credit packs</Link>
              </Button>
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
    </div>
  );
}
