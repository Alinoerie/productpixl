import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingMotionProvider } from "@/components/marketing/motion/marketing-motion-provider";

export function MarketingPageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-radial-warm ${className}`}>
      <SiteHeader />
      <MarketingMotionProvider>
        <main id="main">{children}</main>
      </MarketingMotionProvider>
      <SiteFooter />
    </div>
  );
}
