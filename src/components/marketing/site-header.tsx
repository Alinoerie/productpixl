"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: hamburger (mobile) */}
        <button
          className="md:hidden p-2 text-[#111827]"
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
            className="text-lg font-semibold text-[#111827]"
            style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
          >
            ProductPixl
          </span>
        </Link>

        {/* Spacer to balance hamburger */}
        <div className="w-10 md:hidden" />

        {/* Right: CTAs */}
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
