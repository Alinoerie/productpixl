import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { MarketingCtaBand } from "@/components/marketing/motion/marketing-section";
import { LandingGallery } from "@/components/marketing/landing-gallery";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { Button } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export const metadata: Metadata = {
  title: "Sample gallery — ProductPixl",
  description: "Real ProductPixl listing gallery outputs across beauty, home, and outdoor categories.",
};

export default async function GalleryPage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="Gallery"
        title="Real outputs, not mockups"
        description="Every image below was generated from a single product photo — hero, lifestyle, detail, and packaging modules."
      >
        <div className="mt-8 max-w-sm">
          <ShowcaseMosaic />
        </div>
      </MarketingHero>
      <LandingGallery />
      <MarketingCtaBand
        title="Ready to generate your own?"
        description="Upload one photo — credits shown before you run."
        actions={
          <Button asChild size="lg" className="m-action rounded-xl">
            <Link href={session ? STUDIO_ROUTES.images : "/login"}>
              {session ? "Open images" : "Get started free"}
            </Link>
          </Button>
        }
        className="border-t border-[var(--border)]"
      />
    </MarketingPageShell>
  );
}
