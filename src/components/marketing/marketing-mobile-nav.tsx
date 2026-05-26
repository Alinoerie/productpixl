"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/#workflow", label: "How it works" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#europe", label: "EU & Bol" },
  { href: "/grader", label: "Free grader" },
  { href: "/#compare", label: "Why us" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingMobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open ? (
        <nav className="absolute left-0 right-0 top-16 border-b border-[var(--border)] bg-[var(--background)] px-4 py-4 shadow-[var(--shadow-md)]">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild size="sm" className="w-full">
                <Link href={signedIn ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>
                  {signedIn ? "Open studio" : "Start free"}
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
