import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <MarketingPageShell>{children}</MarketingPageShell>;
}
