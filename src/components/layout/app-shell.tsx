import Link from "next/link";
import { auth } from "@/lib/auth";
import { getActiveBrandId, listBrandsForUser } from "@/lib/brands";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellMobileChrome } from "@/components/layout/app-shell-mobile";
import { CreditBadge } from "@/components/layout/credit-badge";
import { SidebarProvider, SidebarToggle } from "@/components/layout/sidebar-context";
import { CreditsPaywallBanner } from "@/components/ui/credits-paywall-banner";
import { Button } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { getUserCredits } from "@/lib/require-credits";
import { hasPaidCredits } from "@/lib/credits-access";
import { AppShellNav } from "@/components/layout/app-shell-nav";
import { ProductPixlWordmark } from "@/components/brand/productpixl-logo";

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
      <div
        className="min-h-screen bg-[var(--background)]"
        style={{ ["--mobile-nav-offset" as string]: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
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
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--card)]/95 px-3 shadow-[var(--shadow-sm)] backdrop-blur-md sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                {userId ? (
                  <SidebarToggle />
                ) : (
                  <Link href={STUDIO_ROUTES.home}>
                    <ProductPixlWordmark size={44} textClassName="text-lg" />
                  </Link>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {userId ? <AppShellNav studioLocked={studioLocked} /> : null}
                <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
                <div className="md:hidden">
                  <CreditBadge initialCredits={credits} />
                </div>
              </div>
            </header>

            <main
              id="main"
              className="flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-8 md:py-10 md:pb-10"
            >
              {showPaywallBanner && studioLocked ? (
                <div className="mb-6 md:mb-8">
                  <CreditsPaywallBanner />
                </div>
              ) : null}
              {children}
            </main>
          </div>
        </div>

        {userId ? (
          <AppShellMobileChrome
            brands={brands}
            activeBrandId={activeBrandId}
            initialCredits={credits}
            projectCount={projectCount}
            studioLocked={studioLocked}
          />
        ) : null}
      </div>
    </SidebarProvider>
  );
}
