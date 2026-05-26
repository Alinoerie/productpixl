import Image from "next/image";
import Link from "next/link";
import { Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARKETPLACES } from "@/lib/marketplaces";

export function LandingBol() {
  const eu = MARKETPLACES.filter((m) => m.id !== "AMAZON_US" && m.id !== "SHOPIFY");

  return (
    <section id="europe" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
              Europe-first
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Bol.com & EU Amazon — not an afterthought
            </h2>
            <p className="mt-4 text-[var(--muted-fg)]">
              Most US tools assume an ASIN on Amazon.com. ProductPixl is built for sellers launching in
              Benelux and DACH: Dutch-direct tone for Bol, UK spelling, and DE-ready copy — from one
              product photo.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--teal)]" />
                Trust-forward copy — less hype than US Amazon templates
              </li>
              <li className="flex gap-2">
                <Globe className="h-5 w-5 shrink-0 text-[var(--teal)]" />
                Marketplace selector on every image & copy run
              </li>
            </ul>
            <Button asChild className="mt-8" variant="outline">
              <Link href="/grader">Grade your listing free →</Link>
            </Button>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)]">
              <Image
                src="/showcase/zealots/l3-lifestyle.jpg"
                alt="EU marketplace lifestyle product image generated from one photo"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm font-medium text-white">L3 lifestyle · Bol.com-ready tone</p>
                <p className="text-xs text-white/70">From one seller upload</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {eu.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <p className="text-2xl">{m.flag}</p>
                  <p className="mt-2 font-semibold">{m.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--muted-fg)]">{m.copyNote}</p>
                  {m.rufusOptimized && (
                    <span className="mt-3 inline-block rounded-full bg-[var(--teal-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--teal)]">
                      RUFUS-ready
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
