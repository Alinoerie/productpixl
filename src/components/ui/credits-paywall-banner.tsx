import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isCheckoutLive } from "@/lib/checkout";

export function CreditsPaywallBanner({ compact = false }: { compact?: boolean }) {
  const checkoutLive = isCheckoutLive();

  if (compact) {
    return (
      <div
        className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm"
        role="status"
      >
        <p className="font-medium text-[var(--foreground)]">Free credits used</p>
        <p className="mt-1 text-[var(--muted-fg)]">
          {checkoutLive
            ? "Buy a credit pack to run image and copy generation again."
            : "Credit packs are coming soon — billing is not live yet. You can still manage your account and projects."}
        </p>
        <Button asChild size="sm" variant="outline" className="mt-3 border-[var(--warning-border)]">
          <Link href="/pricing?locked=1">View pricing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)]/80 px-4 py-4 md:flex md:items-center md:justify-between md:gap-4"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--warning)]">
          <CreditCard className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-semibold text-[var(--foreground)]">You&apos;ve used your free credits</p>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            {checkoutLive
              ? "Image studio and listing copy are locked until you buy more credits. Projects, brand settings, and the free grader stay open."
              : "Image studio and listing copy are locked. Stripe checkout is a placeholder for now — packs will unlock here when billing goes live."}
          </p>
        </div>
      </div>
      <Button asChild className="mt-3 shrink-0 md:mt-0">
        <Link href="/pricing?locked=1">{checkoutLive ? "Buy credits" : "View pricing"}</Link>
      </Button>
    </div>
  );
}
