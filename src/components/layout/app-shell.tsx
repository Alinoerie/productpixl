import Link from "next/link";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { CreditBadge } from "@/components/layout/credit-badge";
import { CreditsPaywallBanner } from "@/components/ui/credits-paywall-banner";
import { Button } from "@/components/ui/button";
import { AppShellMobileNav, AppShellNav } from "@/components/layout/app-shell-nav";
import { getUserCredits } from "@/lib/require-credits";
import { hasPaidCredits } from "@/lib/credits-access";

export async function AppShell({
  children,
  credits: creditsProp,
  showPaywallBanner = true,
}: {
  children: React.ReactNode;
  credits?: number;
  showPaywallBanner?: boolean;
}) {
  const session = await auth();
  const credits =
    creditsProp ??
    (session?.user?.id ? await getUserCredits(session.user.id) : session?.user?.credits ?? 0);
  const studioLocked = !hasPaidCredits(credits);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--card)] focus:px-4 focus:py-2 focus:shadow-[var(--shadow-md)]"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 shadow-[var(--shadow-sm)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-6 md:gap-8">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ink)] text-[10px] font-bold text-white">
                Px
              </span>
              <span className="font-serif text-lg tracking-tight">ProductPixl</span>
            </Link>
            <AppShellNav className="hidden md:flex" studioLocked={studioLocked} />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CreditBadge initialCredits={credits} />
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden" aria-label="Account">
              <Link href="/account">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </div>
        <AppShellMobileNav studioLocked={studioLocked} />
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-12 md:pb-12">
        {showPaywallBanner && studioLocked ? (
          <div className="mb-8">
            <CreditsPaywallBanner />
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
