"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUp,
  Palette,
  DownloadSimple,
  Sparkle,
  GridFour,
  Coins,
  Shield,
  CreditCard,
  Star,
  Users,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";

// ─── SECTION 1: HERO ───────────────────────────────────────────

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#111827]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#F59E0B" />
            <path d="M10 8h7a4 4 0 010 8h-3v8h-4V8z" fill="white" />
          </svg>
          <span
            className="text-lg font-semibold text-[#111827]"
            style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
          >
            ProductPixl
          </span>
        </Link>

        {/* Spacer */}
        <div className="w-10 md:hidden" />

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#111827] border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="bg-[#F59E0B] text-black rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#D97706] transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-6 flex flex-col gap-4">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-[#111827] py-2 border-b border-[#E5E7EB]"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="bg-[#F59E0B] text-black rounded-full px-5 py-2.5 text-sm font-semibold text-center hover:bg-[#D97706] transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}

function MockupCard({ seed, style }: { seed: string; style?: React.CSSProperties }) {
  return (
    <div
      className="relative bg-white rounded-[8px] border border-[#E5E7EB] shadow-md overflow-hidden"
      style={{ ...style, borderTopWidth: 3, borderTopColor: "#F59E0B" }}
    >
      <div className="absolute top-2 right-2 bg-[#F59E0B] text-black text-[10px] font-bold px-2 py-0.5 rounded">
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
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[55%_45%] lg:gap-16">
          {/* LEFT: copy */}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[#6B7280] mb-4">
              AI product imagery
            </p>
            <h1
              className="text-5xl md:text-6xl font-bold text-[#111827] leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
            >
              One photo.
              <br />
              Every marketplace.
            </h1>
            <p className="mt-6 text-lg text-[#6B7280] max-w-lg leading-relaxed">
              Upload one product photo. Get studio-quality listing images for Amazon, eBay, Etsy and EU
              marketplaces. No photoshoot. No designer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="bg-[#F59E0B] text-black rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#D97706] transition-colors text-center"
              >
                Get started free
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-[#111827] border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors"
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
      className={`bg-white border border-[#E5E7EB] rounded-[8px] p-6 ${className}`}
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
    <section className="bg-[#F9FAFB] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="text-3xl md:text-[36px] font-bold text-[#111827] mb-10"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Everything you need to sell more
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cell 1: Upload once — spans 2 cols */}
          <BentoCell colSpan={2}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB]">
                <ArrowUp size={20} weight="light" className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] text-base">Upload once</h3>
                <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                  One product photo. Any format. Our AI handles the rest.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* Cell 2: Multiple marketplaces — spans 2 rows */}
          <BentoCell rowSpan={2}>
            <h3 className="font-semibold text-[#111827] text-base mb-4">Multiple marketplaces</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-[#F59E0B] border border-[#F59E0B] rounded-full px-3 py-1">
                Amazon
              </span>
              <span className="text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-full px-3 py-1">
                eBay
              </span>
              <span className="text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-full px-3 py-1">
                Etsy
              </span>
              <span className="text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-full px-3 py-1">
                bol.com
              </span>
            </div>
          </BentoCell>

          {/* Cell 3: Studio quality */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB]">
                <Sparkle size={20} weight="light" className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] text-base">Studio quality</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 4: A+ content ready */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB]">
                <GridFour size={20} weight="light" className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] text-base">A+ content ready</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 5: EU & UK included */}
          <BentoCell>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB]">
                <Euflag />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] text-base">EU & UK included</h3>
              </div>
            </div>
          </BentoCell>

          {/* Cell 6: Credits not subscription — spans 2 cols */}
          <BentoCell colSpan={2}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB]">
                <Coins size={20} weight="light" className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F59E0B] text-base">Credits not subscription</h3>
                <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
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
      <circle cx="10" cy="10" r="9" stroke="#6B7280" strokeWidth="1" />
      <circle cx="10" cy="10" r="6" stroke="#6B7280" strokeWidth="1" />
      <circle cx="10" cy="10" r="3" stroke="#6B7280" strokeWidth="1" />
    </svg>
  );
}

// ─── SECTION 3: HOW IT WORKS ───────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: <ArrowUp size={28} weight="light" className="text-[#F59E0B]" />,
    title: "Upload your photo",
    desc: "Drag and drop or click to upload any product image.",
  },
  {
    num: "02",
    icon: <Palette size={28} weight="light" className="text-[#F59E0B]" />,
    title: "Choose your style",
    desc: "Pick from AI styles or let us optimize for each marketplace.",
  },
  {
    num: "03",
    icon: <DownloadSimple size={28} weight="light" className="text-[#F59E0B]" />,
    title: "Download & publish",
    desc: "Get marketplace-ready images in seconds.",
  },
];

function HowItWorksSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-medium uppercase tracking-widest text-[#F59E0B] mb-3">
          How it works
        </p>
        <h2
          className="text-3xl md:text-[40px] font-bold text-[#111827] mb-12"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Three steps to better listings
        </h2>

        {/* Steps with connecting line */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {/* Horizontal connector line (desktop only) */}
          <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-px bg-[#E5E7EB]" />

          {STEPS.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div
                className="text-7xl md:text-[80px] font-bold text-[#F59E0B] leading-none mb-4 opacity-30"
                style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
              >
                {step.num}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold text-[#111827] text-base mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-[#111827]">Ready to stop paying for photoshoots?</p>
          <Link
            href="/login"
            className="bg-[#F59E0B] text-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-[#D97706] transition-colors"
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
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2
          className="text-2xl md:text-[28px] font-bold text-[#111827] text-center mb-12"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Trusted by sellers across Europe
        </h2>

        {/* Monogram logos */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center mb-12">
          {MONOGRAMS.map((m) => (
            <div
              key={m}
              className="w-14 h-14 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] text-sm font-semibold"
            >
              {m}
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="text-center">
          <blockquote className="text-lg md:text-xl italic text-[#111827] leading-relaxed max-w-2xl mx-auto">
            &ldquo;Finally a tool that actually delivers what it promises. My Amazon listings went from
            generic to professional in minutes, not weeks.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-black text-sm font-bold">
              MB
            </div>
            <p className="text-sm text-[#6B7280]">— Marco B., Electronics seller, Amsterdam</p>
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
    <section className="bg-[#F9FAFB] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="text-2xl md:text-3xl font-bold text-[#111827] text-center mb-12"
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
                  ? "bg-white border-2 border-[#F59E0B] shadow-lg"
                  : "bg-white border border-[#E5E7EB]"
              }`}
            >
              {plan.badge && (
                <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wide mb-2">
                  {plan.badge}
                </p>
              )}

              <h3 className="font-semibold text-[#111827] text-base mb-1">{plan.title}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span
                  className="text-3xl font-bold text-[#111827]"
                  style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
                >
                  {plan.price}
                </span>
                {plan.priceSub && <span className="text-sm text-[#6B7280]">{plan.priceSub}</span>}
              </div>

              {plan.name === "Starter" && (
                <p className="text-sm text-[#6B7280] mb-4">No credit card required</p>
              )}

              <ul className="space-y-2 mb-6">
                {plan.bullets.map((b) => (
                  <li key={b} className="text-sm text-[#6B7280] flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path
                        d="M3 8l3.5 3.5L13 4"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block w-full text-center py-2.5 text-sm font-semibold rounded-full transition-colors ${
                  plan.ctaStyle === "solid"
                    ? "bg-[#F59E0B] text-black hover:bg-[#D97706]"
                    : "border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-8">Credits never expire. Cancel anytime.</p>
      </div>
    </section>
  );
}

// ─── SECTION 6: FAQ ─────────────────────────────────────────────

const FAQS = [
  {
    q: "What marketplaces are supported?",
    a: "Amazon (US, UK, DE, FR, ES, IT, NL), eBay, Etsy, bol.com and Walmart. New marketplaces added regularly.",
  },
  {
    q: "What image formats do you support?",
    a: "JPG, PNG, WebP. We handle any aspect ratio and recommend 1500px+ on the longest edge for best results.",
  },
  {
    q: "How do the credits work?",
    a: "Each generation costs 1 credit. Credits reload monthly or on demand. Unused credits never expire.",
  },
  {
    q: "Can I use images commercially?",
    a: "Yes. You retain full commercial rights to all images you generate with ProductPixl.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Every new account starts with 10 free credits. No credit card required.",
  },
  {
    q: "How do I export to Amazon?",
    a: "Download your images or export directly to Seller Central. A+ Content editor included.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#E5E7EB]">
      <button
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#111827] text-base pr-4">{question}</span>
        {open ? (
          <CaretUp size={18} weight="light" className="text-[#6B7280] shrink-0" />
        ) : (
          <CaretDown size={18} weight="light" className="text-[#6B7280] shrink-0" />
        )}
      </button>
      {open && <p className="pb-4 text-sm text-[#6B7280] leading-relaxed">{answer}</p>}
    </div>
  );
}

function FaqSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2
          className="text-2xl md:text-3xl font-bold text-[#111827] text-center mb-10"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Common questions
        </h2>

        <div>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 7: FINAL CTA ──────────────────────────────────────

function FinalCtaSection() {
  return (
    <section className="bg-[#0F0E0D] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2
          className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
        >
          Stop paying 2000 euros for listing photos
        </h2>
        <p className="text-lg text-[#9CA3AF] mb-8 max-w-xl mx-auto">
          Join thousands of sellers already using ProductPixl. Get 10 free credits when you sign up.
        </p>

        <Link
          href="/login"
          className="inline-block bg-[#F59E0B] text-black rounded-full px-10 py-4 text-base font-semibold hover:bg-[#D97706] transition-colors"
        >
          Get started free
        </Link>

        <p className="mt-4 text-sm text-[#6B7280]">No credit card. No subscription. Just free credits.</p>

        {/* Trust row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <Shield size={18} weight="light" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={18} weight="light" />
            <span>Many payment options</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={18} weight="light" />
            <span>4.8 rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} weight="light" />
            <span>10k+ sellers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE EXPORT ───────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
