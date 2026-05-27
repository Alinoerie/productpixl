import type { Metadata } from "next";
import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { MarketingCtaBand } from "@/components/marketing/motion/marketing-section";
import { LandingCompare } from "@/components/marketing/landing-compare";
import { UspContrastSection, UspLeverageSection } from "@/components/marketing/usp-sections";
import { Button } from "@/components/ui/button";
import { USP_ONE_LINER, USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";

export const metadata: Metadata = {
  title: "Why ProductPixl — compare listing tools",
  description: USP_ONE_LINER,
};

export default async function ComparePage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={USP_TAGLINE}
        title="Launch before you list — then compare the alternatives"
        description={USP_SUBHEAD}
        actions={
          <Button asChild size="lg" className="m-action rounded-xl">
            <Link href={session ? STUDIO_ROUTES.images : "/login"}>
              {session ? "Start generating" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <LandingCompare />
      <UspContrastSection />
      <UspLeverageSection />
      <MarketingCtaBand
        title="Compare credit packs"
        description="Only pay when you generate."
        actions={
          <Button asChild variant="outline" className="m-action rounded-xl">
            <Link href="/pricing">View pricing →</Link>
          </Button>
        }
      />
    </MarketingPageShell>
  );
}
