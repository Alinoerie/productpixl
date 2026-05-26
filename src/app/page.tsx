import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  CreditCard,
  Globe,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { LandingGallery } from "@/components/marketing/landing-gallery";
import { LandingBol } from "@/components/marketing/landing-bol";
import { LandingCalculator } from "@/components/marketing/landing-calculator";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SHOWCASE_MODULE_SAMPLES } from "@/lib/showcase";

const MODULES = [
  { id: "L1", label: "Main hero", desc: "White-background hero, Amazon-compliant 1:1" },
  { id: "L3", label: "Lifestyle", desc: "In-context scene that sells the use case" },
  { id: "L4", label: "Detail", desc: "Texture, materials, and label fidelity" },
  { id: "L8", label: "Packaging", desc: "Optional unboxing / pack shot module" },
];

const WORKFLOW = [
  {
    icon: Camera,
    title: "Upload one photo",
    body: "No ASIN required. Works for new launches, private label, and Bol.com — not just existing Amazon listings.",
  },
  {
    icon: Sparkles,
    title: "AI analyzes & researches",
    body: "Vision reads your label and materials. Tavily pulls category patterns before anything is generated.",
  },
  {
    icon: Layers,
    title: "PHOILA-style pipeline",
    body: "Hero, lifestyle, detail — built with listing-specific prompts, not generic “make it pretty” AI.",
  },
  {
    icon: Zap,
    title: "Download & publish",
    body: "Gallery images plus RUFUS-ready listing copy. One credit per image run or copy run.",
  },
];

const STATS = [
  { value: "1 photo", label: "Input — not an ASIN" },
  { value: "~2 min", label: "Analyze to brief" },
  { value: "1 credit", label: "Per pipeline run" },
  { value: "10 free", label: "Credits on signup" },
];

export default async function HomePage() {
  const session = await auth();
  const cta = session ? "/generate" : "/login";

  return (
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="text-center lg:text-left">
              <Badge variant="outline" className="mb-6 border-[var(--border-strong)] bg-[var(--card)] px-3 py-1">
                Amazon · Bol.com · EU & US sellers
              </Badge>
              <h1 className="animate-fade-up font-serif text-4xl leading-[1.08] tracking-tight text-balance md:text-6xl lg:text-6xl xl:text-7xl">
                One product photo.
                <br />
                <span className="text-[var(--accent)]">A complete listing studio.</span>
              </h1>
              <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-fg)] [animation-delay:80ms] lg:mx-0">
                ProductPixl turns a single shot into marketplace gallery images and conversion-focused copy —
                researched, generated, and QA-scored. No photoshoot. No $207/mo subscription. No prompt engineering.
              </p>
              <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:160ms] lg:justify-start">
                <Button asChild size="lg" className="rounded-xl px-8">
                  <Link href={cta}>
                    Start generating
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link href="/grader">Free listing grader</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-[var(--muted-fg)]">
                10 free credits · No credit card · Pay per generation, not per month
              </p>
            </div>

            <div className="animate-fade-up mx-auto w-full max-w-md [animation-delay:120ms] lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--accent-soft)] to-[var(--teal-soft)] opacity-70 blur-2xl" />
                <ShowcaseMosaic priority className="relative rotate-1 lg:rotate-2" />
              </div>
              <p className="mt-4 text-center text-xs text-[var(--muted-fg)] lg:text-left">
                Real PHOILA outputs — hand soap, skincare, furniture
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-up mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4 [animation-delay:240ms]">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4 text-center shadow-[var(--shadow-sm)] backdrop-blur-sm"
              >
                <p className="font-serif text-2xl text-[var(--ink)]">{s.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              From raw photo to publication-ready — in one flow
            </h2>
            <p className="mt-4 text-[var(--muted-fg)]">
              Competitors like Pixii start from an ASIN. ProductPixl starts from your product — ideal for new
              SKUs, European marketplaces, and sellers who do not have a live listing yet.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, i) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <span className="absolute right-4 top-4 font-serif text-4xl text-[var(--muted)]/40">
                  {i + 1}
                </span>
                <step.icon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs */}
      <section id="outputs" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Image pipeline
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">Listing modules that convert</h2>
            </div>
            <Badge variant="secondary">1 credit · full image run</Badge>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => {
              const sample = SHOWCASE_MODULE_SAMPLES[m.id as keyof typeof SHOWCASE_MODULE_SAMPLES];
              return (
                <div
                  key={m.id}
                  className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted)]">
                    <Image
                      src={sample.image}
                      alt={sample.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 280px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2.5 py-1 font-serif text-sm text-white">
                      {m.id}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{m.label}</h3>
                    <p className="mt-1 text-sm text-[var(--muted-fg)]">{m.desc}</p>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-[var(--teal)]">
                      Sample · {sample.product}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-[var(--muted-fg)]">
            Plus listing copy: title, 5 bullets, description, backend keywords — optimized for A9 + semantic
            search surfaces.
          </p>
        </div>
      </section>

      <LandingGallery />
      <LandingBol />
      <LandingCalculator />

      {/* Compare */}
      <section id="compare" className="border-y border-[var(--border)] bg-[var(--ink)] px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
              Why ProductPixl
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Built for sellers Pixii and suites leave behind
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/60">Typical AI listing tools</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex gap-2">
                  <span className="text-white/40">—</span> $207+/mo subscription (Pixii Growth)
                </li>
                <li className="flex gap-2">
                  <span className="text-white/40">—</span> Requires existing Amazon ASIN
                </li>
                <li className="flex gap-2">
                  <span className="text-white/40">—</span> Text-only tools with no images
                </li>
                <li className="flex gap-2">
                  <span className="text-white/40">—</span> Generic AI — no category research
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
              <p className="text-sm font-medium text-orange-200">ProductPixl</p>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Pay per generation — 10 free credits to start",
                  "One photo in — no ASIN, no photoshoot",
                  "Images + copy in one account",
                  "Tavily research + PHOILA prompt pipeline",
                  "Amazon-first with EU / Bol.com positioning",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-orange-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: CreditCard, title: "No subscription lock-in", body: "Unlike $49–207/mo tools, you only pay when you generate." },
              { icon: Globe, title: "Photo-first, not ASIN-first", body: "Launch on Amazon or Bol before the listing exists." },
              { icon: Clock, title: "Hours → minutes", body: "Traditional listing creative: 5–6 hours per SKU. We target a fraction of that." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 p-4">
                <item.icon className="h-6 w-6 shrink-0 text-orange-300" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-white/70">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFaq />

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[var(--shadow-lg)] md:p-14">
          <h2 className="font-serif text-3xl md:text-4xl">Ready to replace the photoshoot?</h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--muted-fg)]">
            Sign in with Google, get 10 credits, and run your first image pipeline in minutes.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-xl px-10">
            <Link href={cta}>
              Open the studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
