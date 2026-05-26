"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTENT_STUDIO_TABS } from "@/lib/studio-routes";
import { cn } from "@/lib/utils";

export function ContentStudioSubnav({ studioLocked = false }: { studioLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5"
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
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
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
