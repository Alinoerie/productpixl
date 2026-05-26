import Link from "next/link";
import { auth } from "@/lib/auth";
import { getActiveBrandId, listBrandsForUser } from "@/lib/brands";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CreditBadge } from "@/components/layout/credit-badge";
import { SidebarProvider, SidebarToggle } from "@/components/layout/sidebar-context";
import { CreditsPaywallBanner } from "@/components/ui/credits-paywall-banner";
import { Button } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { getUserCredits } from "@/lib/require-credits";
import { hasPaidCredits } from "@/lib/credits-access";
import { AppShellNav } from "@/components/layout/app-shell-nav";

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
  const userId = session?.user?.id;
  const credits =
    creditsProp ??
    (userId ? await getUserCredits(userId) : session?.user?.credits ?? 0);
  const studioLocked = !hasPaidCredits(credits);

  const [brands, activeBrandId, projectCount] = userId
    ? await Promise.all([
        listBrandsForUser(userId),
        getActiveBrandId(userId),
        prisma.product.count({ where: { userId } }),
      ])
    : [[], "", 0];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--card)] focus:px-4 focus:py-2 focus:shadow-[var(--shadow-md)]"
        >
          Skip to main content
        </a>

        <div className="flex min-h-screen">
          {userId ? (
            <AppSidebar
              brands={brands}
              activeBrandId={activeBrandId}
              initialCredits={credits}
              studioLocked={studioLocked}
              projectCount={projectCount}
            />
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 shadow-[var(--shadow-sm)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <SidebarToggle />
                {!userId ? (
                  <Link href={STUDIO_ROUTES.home} className="font-serif text-lg">
                    ProductPixl
                  </Link>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {userId ? <AppShellNav studioLocked={studioLocked} /> : null}
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/account?invite=1">Invite</Link>
                </Button>
                <div className="md:hidden">
                  <CreditBadge initialCredits={credits} />
                </div>
              </div>
            </header>

            <main
              id="main"
              className="flex-1 px-4 py-8 pb-24 md:px-8 md:py-10 md:pb-10"
            >
              {showPaywallBanner && studioLocked ? (
                <div className="mb-8">
                  <CreditsPaywallBanner />
                </div>
              ) : null}
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
