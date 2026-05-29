import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import { MarketingCtaBand } from "@/components/marketing/motion/marketing-section";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ — ProductPixl",
  description: "Credits, ASINs, Bol.com, listing grader, and how ProductPixl compares to subscription tools.",
};

export default async function FaqPage() {
  const session = await auth();

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="FAQ"
        title="Common questions"
        description="Still unsure? Try the free grader first — no credits required."
        actions={
          <Button asChild variant="outline" className="m-action rounded-xl">
            <Link href="/grader">Open free grader</Link>
          </Button>
        }
        className="pb-8"
      />
      <LandingFaq showHeader={false} />
      <MarketingCtaBand
        title="Next: see pricing"
        description="Pay per generation — 10 free credits on signup."
        actions={
          <Button asChild className="m-action rounded-xl">
            <Link href="/pricing">{session ? "View credits" : "Get free credits"}</Link>
          </Button>
        }
        className="pb-20"
      />
    </MarketingPageShell>
  );
}
