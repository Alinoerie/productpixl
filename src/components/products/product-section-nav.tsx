"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function ProductSectionNav({
  hasCopy,
  hasGallery,
}: {
  hasCopy: boolean;
  hasGallery: boolean;
}) {
  const links = [
    { href: "#readiness", label: "Readiness" },
    { href: "#export", label: "Export" },
    ...(hasGallery ? [{ href: "#gallery", label: "Gallery" as const }] : []),
    ...(hasCopy ? [{ href: "#listing", label: "Copy" as const }] : []),
  ];

  return (
    <nav
      aria-label="Jump to section"
      className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-2 backdrop-blur-sm scrollbar-none md:mx-0 md:rounded-xl md:border md:px-3"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-fg)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
