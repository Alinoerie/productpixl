"use client";

import Link from "next/link";
import type { BrandSummary } from "@/lib/brands";
import { SidebarNavContent } from "@/components/layout/sidebar-nav-content";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

export function AppSidebar({
  brands,
  activeBrandId,
  initialCredits,
  studioLocked,
  projectCount = 0,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  initialCredits: number;
  studioLocked: boolean;
  projectCount?: number;
}) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <SidebarNavContent
        brands={brands}
        activeBrandId={activeBrandId}
        initialCredits={initialCredits}
        projectCount={projectCount}
        collapsed={collapsed}
        studioLocked={studioLocked}
      />
    </aside>
  );
}
