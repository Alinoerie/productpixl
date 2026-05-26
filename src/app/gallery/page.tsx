import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
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
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Gallery</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Real outputs, not mockups</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">
            Every image below was generated from a single product photo — hero, lifestyle, detail, and packaging modules.
          </p>
          <div className="mt-8 max-w-sm">
            <ShowcaseMosaic />
          </div>
        </div>
      </section>
      <LandingGallery />
      <section className="border-t border-[var(--border)] px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Ready to generate your own?</h2>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">Upload one photo — credits shown before you run.</p>
          </div>
          <Button asChild size="lg">
            <Link href={session ? STUDIO_ROUTES.images : "/login"}>{session ? "Open images" : "Get started free"}</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
