"use client";

import Link from "next/link";
import {
  ArrowUp,
  Palette,
  DownloadSimple,
  Sparkle,
  GridFour,
  Coins,
} from "@phosphor-icons/react";

// ─── SECTION 1: HERO ───────────────────────────────────────────

function MockupCard({ seed, style }: { seed: string; style?: React.CSSProperties }) {
  return (
    <div
      className="relative rounded-[8px] border border-[var(--border)] shadow-md overflow-hidden bg-[var(--surface)]"
      style={{ ...style, borderTopWidth: 3, borderTopColor: "var(--amber)" }}
    >
      <div className="absolute top-2 right-2 bg-[var(--amber)] text-black text-[10px] font-bold px-2 py-0.5 rounded">
        DEMO OUTPUT
      </div>
      <img
        src={`https://picsum.photos/seed/${seed}/400/300`}
        alt="Product listing mockup"
        className="w-full h-auto block"
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[55%_45%] lg:gap-16">
          {/* LEFT: copy */}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">
              AI product imagery
            </p>
            <h1
              className="text-5xl md:text-6xl font-bold text-[var(--text)] leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
            >
              One photo.
              <br />
              Every marketplace.
            </h1>
            <p className="mt-6 text-lg text-[var(--text-muted)] max-w-lg leading-relaxed">
              Upload one product photo. Get studio-quality listing images for Amazon, eBay, Etsy and EU
              marketplaces. No photoshoot. No designer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="bg-[var(--amber)] text-black rounded-full px-6 py-3 text-sm font-semibold hover:bg-[var(--amber-dark)] transition-colors text-center"
              >
                Get started free
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-[var(--text)] border border-[var(--border)] rounded-full hover:bg-[var(--bg-2)] transition-colors"
              >
                See examples →
              </Link>
            </div>
          </div>

          {/* RIGHT: mockup cards */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Amazon card */}
              <div className="absolute right-0 top-0 rotate-[2deg] z-30 w-[85%]">
                <MockupCard seed="watch" />
              </div>
              {/* eBay card */}
              <div className="absolute right-4 top-16 rotate-[1deg] z-20 w-[85%]">
                <MockupCard seed="headphones" />
              </div>
              {/* Etsy card (back) */}
              <div className="relative z-10 w-[85%] ml-auto rotate-[-1deg]">
                <MockupCard seed="sneakers" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2: BENTO FEATURES ─────────────────────────────────

function BentoCell({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = "",
}: {
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function BentoSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="text-3xl md:text-[36px] font-bold text-[var(--text)] mb-10"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Everything you need to sell more
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cell 1: Upload once — spans 2 cols */}
          <BentoCell colSpan={2}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)]">
                <ArrowUp size={20} weight="light" className="text-[var(--amber)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-base">Upload once</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
                  One product photo. Any format. Our AI handles the rest.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* Cell 2: Multiple marketplaces — spans 2 rows */}
          <BentoCell rowSpan={2}>
            <h3 className="font-semibold text-[var(--text)] text-base mb-4">Multiple marketplaces</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-[var(--amber)] border border-[var(--amber)] rounded-full px-3 py-1">
                Amazon
              </span>
              <span className="text-sm font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-full px-3 py-1">
                eBay
              </span>
              <span className="text-sm font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-full px-3 py-1">
                Etsy
              </span>
              <span className="text-sm font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-full px-3 py-1">
                bol.com
              </span>
            </div>
          </BentoCell>

          {/* Cell 3: Studio quality */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)]">
                <Sparkle size={20} weight="light" className="text-[var(--amber)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-base">Studio quality</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 4: A+ content ready */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)]">
                <GridFour size={20} weight="light" className="text-[var(--amber)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-base">A+ content ready</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 5: EU & UK included */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)]">
                <Euflag />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-base">EU & UK included</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 6: Credits not subscription — spans 2 cols */}
          <BentoCell colSpan={2}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)]">
                <Coins size={20} weight="light" className="text-[var(--amber)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--amber)] text-base">Credits not subscription</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
                  Pay per generation. No monthly fees. Start free with 10 credits.
                </p>
              </div>
            </div>
          </BentoCell>
        </div>
      </div>
    </section>
  );
}

function Euflag() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="var(--text-muted)" strokeWidth="1" />
      <circle cx="10" cy="10" r="6" stroke="var(--text-muted)" strokeWidth="1" />
      <circle cx="10" cy="10" r="3" stroke="var(--text-muted)" strokeWidth="1" />
    </svg>
  );
}

// ─── SECTION 3: HOW IT WORKS ───────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: <ArrowUp size={28} weight="light" className="text-[var(--amber)]" />,
    title: "Upload your photo",
    desc: "Drag and drop or click to upload any product image.",
  },
  {
    num: "02",
    icon: <Palette size={28} weight="light" className="text-[var(--amber)]" />,
    title: "Choose your style",
    desc: "Pick from AI styles or let us optimize for each marketplace.",
  },
  {
    num: "03",
    icon: <DownloadSimple size={28} weight="light" className="text-[var(--amber)]" />,
    title: "Download & publish",
    desc: "Get marketplace-ready images in seconds.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--amber)] mb-3">
          How it works
        </p>
        <h2
          className="text-3xl md:text-[40px] font-bold text-[var(--text)] mb-12"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Three steps to better listings
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-px bg-[var(--border)]" />

          {STEPS.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div
                className="text-7xl md:text-[80px] font-bold text-[var(--amber)] leading-none mb-4 opacity-30"
                style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
              >
                {step.num}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--bg-2)] mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold text-[var(--text)] text-base mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-[var(--text)]">Ready to stop paying for photoshoots?</p>
          <Link
            href="/login"
            className="bg-[var(--amber)] text-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-[var(--amber-dark)] transition-colors"
          >
            Start generating free
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4: SOCIAL PROOF ───────────────────────────────────

const MONOGRAMS = ["TK", "VS", "HW", "BM", "NL", "SF"];

function SocialProofSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2
          className="text-2xl md:text-[28px] font-bold text-[var(--text)] text-center mb-12"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Trusted by sellers across Europe
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center mb-12">
          {MONOGRAMS.map((m) => (
            <div
              key={m}
              className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] text-sm font-semibold"
            >
              {m}
            </div>
          ))}
        </div>

        <div className="text-center">
          <blockquote className="text-lg md:text-xl italic text-[var(--text)] leading-relaxed max-w-2xl mx-auto">
            &ldquo;Finally a tool that actually delivers what it promises. My Amazon listings went from
            generic to professional in minutes, not weeks.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--amber)] flex items-center justify-center text-black text-sm font-bold">
              MB
            </div>
            <p className="text-sm text-[var(--text-muted)]">— Marco B., Electronics seller, Amsterdam</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: PRICING ────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    title: "10 credits",
    price: "Free",
    priceSub: null,
    badge: null,
    featured: false,
    bullets: ["10 generations", "Amazon export", "Email support"],
    cta: "Start free",
    ctaStyle: "outline" as const,
  },
  {
    name: "Pro",
    title: "100 credits/mo",
    price: "€29",
    priceSub: "/mo",
    badge: "Most popular",
    featured: true,
    bullets: ["100 generations", "All marketplaces", "Priority support", "A+ templates"],
    cta: "Get started",
    ctaStyle: "solid" as const,
  },
  {
    name: "Scale",
    title: "500 credits/mo",
    price: "€99",
    priceSub: "/mo",
    badge: null,
    featured: false,
    bullets: ["500 generations", "Everything in Pro", "Dedicated support", "Custom styles"],
    cta: "Get started",
    ctaStyle: "outline" as const,
  },
];

function PricingSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="text-2xl md:text-3xl font-bold text-[var(--text)] text-center mb-12"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Simple credits, no commitment
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative w-full max-w-[280px] rounded-[8px] p-6 ${
                plan.featured
                  ? "border-2 border-[var(--amber)] bg-[var(--surface)]"
                  : "border border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {plan.badge && (
                <p className="text-xs font-semibold text-[var(--amber)] uppercase tracking-wide mb-2">
                  {plan.badge}
                </p>
              )}
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{plan.name}</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">{plan.title}</p>
              <p className="text-3xl font-bold text-[var(--text)] mb-1">
                {plan.price}
                {plan.priceSub && <span className="text-base font-normal text-[var(--text-muted)]">{plan.priceSub}</span>}
              </p>
              <ul className="mt-4 mb-6 space-y-2">
                {plan.bullets.map((b) => (
                  <li key={b} className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                    <span className="text-[var(--amber)]">✓</span> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`block w-full text-center py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  plan.ctaStyle === "solid"
                    ? "bg-[var(--amber)] text-black hover:bg-[var(--amber-dark)]"
                    : "border border-[var(--border)] text-[var(--text)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          All plans include 10 free starter credits. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
    </>
  );
}
