import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingHero } from "@/components/marketing/motion/marketing-hero";
import {
  MarketingCtaBand,
  MarketingSection,
  MarketingStagger,
  MarketingStaggerItem,
} from "@/components/marketing/motion/marketing-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LISTING_MODULES, WORKFLOW_STEPS } from "@/lib/marketing-content";
import { USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";
import { SHOWCASE_MODULE_SAMPLES } from "@/lib/showcase";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export const metadata: Metadata = {
  title: "How it works — ProductPixl",
  description: "From one product photo to gallery images and listing copy in a single guided studio flow.",
};

export default async function HowItWorksPage() {
  const session = await auth();
  const cta = session ? STUDIO_ROUTES.images : "/login";

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={USP_TAGLINE}
        title="From raw photo to publication-ready — in one flow"
        description={USP_SUBHEAD}
        actions={
          <Button asChild size="lg" className="m-action rounded-xl">
            <Link href={cta}>
              {session ? "Start image studio" : "Sign in to start"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <MarketingSection className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-16" scroll={false}>
        <div className="mx-auto max-w-6xl">
          <MarketingStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <MarketingStaggerItem key={step.title}>
                <div className="relative h-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]">
                  <span className="absolute right-4 top-4 font-serif text-4xl text-[var(--muted)]/40">{i + 1}</span>
                  <step.icon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} />
                  <h2 className="mt-4 font-semibold">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{step.body}</p>
                </div>
              </MarketingStaggerItem>
            ))}
          </MarketingStagger>
        </div>
      </MarketingSection>

      <MarketingSection className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div data-m-scroll className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Listing modules</h2>
              <p className="mt-2 text-[var(--muted-fg)]">Each module uses your original photo as the product reference.</p>
            </div>
            <Badge variant="secondary">Credits shown before each run</Badge>
          </div>
          <MarketingStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LISTING_MODULES.map((m) => {
              const sample =
                m.id in SHOWCASE_MODULE_SAMPLES
                  ? SHOWCASE_MODULE_SAMPLES[m.id as keyof typeof SHOWCASE_MODULE_SAMPLES]
                  : null;
              return (
                <MarketingStaggerItem key={m.id}>
                  <div className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition-transform duration-500 hover:-translate-y-1 motion-reduce:transform-none">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted)]" data-m-parallax>
                      {sample ? (
                        <Image
                          src={sample.image}
                          alt={sample.alt}
                          fill
                          sizes="280px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--muted-fg)]">
                          Sample coming soon — available in the full L1–L12 library
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2.5 py-1 font-serif text-sm text-white">
                        {m.id}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{m.label}</h3>
                      <p className="mt-1 text-sm text-[var(--muted-fg)]">{m.desc}</p>
                    </div>
                  </div>
                </MarketingStaggerItem>
              );
            })}
          </MarketingStagger>
        </div>
      </MarketingSection>

      <MarketingCtaBand
        title="Next: see sample outputs"
        description="Real gallery runs from ProductPixl."
        actions={
          <Button asChild variant="outline" className="m-action rounded-xl">
            <Link href="/gallery">View gallery →</Link>
          </Button>
        }
        className="border-t border-[var(--border)]"
      />
    </MarketingPageShell>
  );
}
