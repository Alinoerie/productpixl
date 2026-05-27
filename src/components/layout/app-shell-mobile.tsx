"use client";

import type { BrandSummary } from "@/lib/brands";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { AppShellBottomNav } from "@/components/layout/app-shell-nav";
import { useSidebar } from "@/components/layout/sidebar-context";

export function AppShellMobileChrome({
  brands,
  activeBrandId,
  initialCredits,
  projectCount,
  studioLocked,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  initialCredits: number;
  projectCount: number;
  studioLocked: boolean;
}) {
  const { mobileOpen, closeMobile, openMobile } = useSidebar();

  return (
    <>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={closeMobile}
        brands={brands}
        activeBrandId={activeBrandId}
        initialCredits={initialCredits}
        projectCount={projectCount}
        studioLocked={studioLocked}
      />
      <AppShellBottomNav onOpenMenu={openMobile} />
    </>
  );
}
