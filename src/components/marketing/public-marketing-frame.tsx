import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingMotionProvider } from "@/components/marketing/motion/marketing-motion-provider";

/** Logged-out marketing layout with GSAP orchestration (grader, pricing, etc.). */
export function PublicMarketingFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-hero-glow ${className}`}>
      <SiteHeader />
      <MarketingMotionProvider>
        <main id="main">{children}</main>
      </MarketingMotionProvider>
      <SiteFooter />
    </div>
  );
}
