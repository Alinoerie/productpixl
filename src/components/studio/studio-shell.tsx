"use client";

import { StudioSwitcherBar } from "@/components/studio/studio-switcher-bar";
import { BrandContextStrip } from "@/components/studio/brand-context-strip";
import { CreditWidget } from "@/components/studio/credit-widget";
import { StudioPageHeading } from "@/components/studio/studio-page-heading";
import { StudioProvider } from "@/stores/studio-provider";

export function StudioShell({
  children,
  studioLocked,
  initialCredits,
  brands,
  activeBrandId,
}: {
  children: React.ReactNode;
  studioLocked: boolean;
  initialCredits: number;
  brands: { id: string; name: string }[];
  activeBrandId: string;
}) {
  return (
    <StudioProvider>
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <StudioSwitcherBar studioLocked={studioLocked} />
          </div>
          <CreditWidget initialCredits={initialCredits} />
        </div>
        <BrandContextStrip brands={brands} activeBrandId={activeBrandId} />
        <StudioPageHeading />
        {children}
      </div>
    </StudioProvider>
  );
}
