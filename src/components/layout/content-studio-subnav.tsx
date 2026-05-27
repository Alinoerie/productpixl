"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTENT_STUDIO_TABS } from "@/lib/studio-routes";
import { cn } from "@/lib/utils";

export function ContentStudioSubnav({
  studioLocked = false,
  className,
}: {
  studioLocked?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "sticky top-14 z-30 flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--background)]/95 py-2 backdrop-blur-sm scrollbar-none md:rounded-xl md:border md:px-3",
        className
      )}
      aria-label="Content studio sections"
    >
      {CONTENT_STUDIO_TABS.map((tab) => {
        const active = tab.match(pathname);
        const locked =
          studioLocked && (tab.href === CONTENT_STUDIO_TABS[1].href || tab.href === CONTENT_STUDIO_TABS[2].href);
        const href = locked ? "/pricing?locked=1" : tab.href;
        return (
          <Link
            key={tab.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors min-h-11 flex items-center",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              locked && "opacity-60"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
