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

    const firstLink = panelRef.current?.querySelector("a");
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
    <div className="lg:hidden">
      <Button
        ref={toggleRef}
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls="marketing-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-black/20"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id="marketing-mobile-nav"
            ref={panelRef}
            className="absolute left-0 right-0 top-16 z-50 border-b border-[var(--border)] bg-[var(--background)] px-4 py-4 shadow-[var(--shadow-md)]"
          >
            <ul className="space-y-1">
              {MARKETING_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]",
                      link.highlight === "teal" && "text-[var(--teal)]",
                      link.highlight === "accent" && "text-[var(--accent)]"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild size="sm" className="w-full">
                  <Link href={signedIn ? STUDIO_ROUTES.home : "/login"} onClick={() => setOpen(false)}>
                    {signedIn ? "Open studio" : "Start free"}
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
