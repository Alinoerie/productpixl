"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ProductPixlWordmark } from "@/components/brand/productpixl-logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/gallery", label: "Gallery" },
  { href: "/compare", label: "Compare" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/90 backdrop-blur-xl shadow-[0_1px_0_0_var(--border)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ProductPixlWordmark size={44} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {session ? (
            <Button asChild size="sm">
              <Link href="/studio">Open studio</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="bg-amber-500 text-black rounded-lg px-4 py-2 text-sm font-semibold hover:amber-glow transition-all"
              >
                Start free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <MobileMenu session={!!session} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ session }: { session: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 text-[var(--foreground)]"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] px-4 py-6 flex flex-col gap-4 animate-fade-up">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors py-2 animate-fade-up",
                `stagger-${i + 1}`
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3 animate-fade-up stagger-5">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn-ghost text-sm font-medium text-center"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="bg-amber-500 text-black rounded-lg px-4 py-2.5 text-sm font-semibold text-center hover:amber-glow transition-all"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
