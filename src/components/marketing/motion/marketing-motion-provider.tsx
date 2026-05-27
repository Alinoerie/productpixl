"use client";

import { useMarketingPageMotion } from "@/hooks/use-marketing-gsap";

export function MarketingMotionProvider({ children }: { children: React.ReactNode }) {
  useMarketingPageMotion();
  return <>{children}</>;
}
