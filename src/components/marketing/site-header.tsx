"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: hamburger (mobile) */}
        <button
          className="md:hidden p-2 text-[var(--text)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={24} weight="light" />
          ) : (
            <List size={24} weight="light" />
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span
            className="text-lg font-semibold text-[var(--text)]"
            style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
          >
            ProductPixl
          </span>
        </Link>

        {/* Spacer to balance hamburger */}
        <div className="w-10 md:hidden" />

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          <ThemeToggle className="p-2 rounded-full hover:bg-[var(--bg-2)] transition-colors text-[var(--text)]" />
          <Link
            href="/login"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[var(--text)] border border-[var(--border)] rounded-full hover:bg-[var(--bg-2)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="bg-[var(--amber)] text-black rounded-full px-5 py-2 text-sm font-semibold hover:bg-[var(--amber-dark)] transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-6 flex flex-col gap-4">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-[var(--text)] py-2 border-b border-[var(--border)]"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="bg-[var(--amber)] text-black rounded-full px-5 py-2.5 text-sm font-semibold text-center hover:bg-[var(--amber-dark)] transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#F59E0B" />
      <path
        d="M10 8h7a4 4 0 010 8h-3v8h-4V8z"
        fill="white"
      />
    </svg>
  );
}
