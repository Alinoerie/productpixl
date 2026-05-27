"use client";

import { BrandKitStudio } from "@/components/brand/brand-kit/brand-kit-studio";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import type { JourneyStep } from "@/lib/user-journey";
import { useState } from "react";

export function BrandKitPage({ guide }: { guide: JourneyStep }) {
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);

  return (
    <StudioPageShell
      eyebrow="Brand"
      title="Listing brand kit"
      description="Set colors, voice, and rules once per brand. Every image and copy run pulls from the active brand in your sidebar."
      guide={guide}
      headerActions={headerActions}
      className="max-w-[1400px]"
    >
      <BrandKitStudio onHeaderActions={setHeaderActions} />
    </StudioPageShell>
  );
}
