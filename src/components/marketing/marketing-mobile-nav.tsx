"use client";

import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV_LINKS } from "@/lib/marketing-links";
import { cn } from "@/lib/utils";

export function MarketingMobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = panelRef.current?.querySelector("a, button");
    if (firstLink instanceof HTMLElement) firstLink.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        ref={toggleRef}
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11"
        aria-expanded={open}
        aria-controls="marketing-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id="marketing-mobile-nav"
            ref={panelRef}
            className="absolute bottom-0 left-0 top-0 flex w-[min(100%,20rem)] flex-col border-r border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="font-serif text-lg">ProductPixl</span>
              <Button type="button" variant="ghost" size="sm" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ul className="flex-1 space-y-1 overflow-y-auto p-4">
              {MARKETING_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-[var(--muted)]",
                      link.highlight === "teal" && "text-[var(--teal)]",
                      link.highlight === "accent" && "text-[var(--accent)]"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-[var(--border)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {!signedIn ? (
                <Button asChild variant="outline" className="w-full min-h-11">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              ) : null}
              <Button asChild className="w-full min-h-11">
                <Link href={signedIn ? STUDIO_ROUTES.home : "/login"} onClick={() => setOpen(false)}>
                  {signedIn ? "Open studio" : "Start free — 10 credits"}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
