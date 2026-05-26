"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function ProductSectionNav({
  hasCopy,
  hasGallery,
}: {
  hasCopy: boolean;
  hasGallery: boolean;
}) {
  const links = useMemo(
    () =>
      [
        { href: "#readiness", label: "Readiness" },
        { href: "#export", label: "Export" },
        ...(hasGallery ? [{ href: "#gallery", label: "Gallery" as const }] : []),
        ...(hasCopy ? [{ href: "#listing", label: "Copy" as const }] : []),
      ] as const,
    [hasCopy, hasGallery]
  );

  const [active, setActive] = useState<string>(links[0]?.href ?? "#readiness");

  useEffect(() => {
    const sectionIds = links.map((link) => link.href.slice(1));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-24% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [links]);

  return (
    <nav
      aria-label="Jump to section"
      className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-2 backdrop-blur-sm scrollbar-none md:mx-0 md:rounded-xl md:border md:px-3"
    >
      {links.map((link) => {
        const isActive = active === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-fg)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
