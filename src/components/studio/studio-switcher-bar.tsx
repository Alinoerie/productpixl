"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Grid3X3, Images, Type, PlayCircle } from "lucide-react";
import gsap from "gsap";
import { CONTENT_STUDIO_TABS } from "@/lib/studio-routes";
import { typicalCopyRunCredits, typicalImageRunCredits } from "@/lib/credit-pricing";
import { CreditChip } from "@/components/studio/credit-chip";
import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";
import { prefersReducedMotion } from "@/hooks/use-studio-gsap";

const TAB_ICONS = {
  Overview: Grid3X3,
  Images: Images,
  Copy: Type,
  Video: PlayCircle,
} as const;

const TAB_CREDITS: Record<string, number> = {
  Images: typicalImageRunCredits(),
  Copy: typicalCopyRunCredits(),
  Video: 85,
};

export function StudioSwitcherBar({
  studioLocked = false,
  className,
}: {
  studioLocked?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeIndex = CONTENT_STUDIO_TABS.findIndex((t) => t.match(pathname));

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || activeIndex < 0) return;
    const btn = nav.querySelectorAll<HTMLElement>("[data-studio-tab]")[activeIndex];
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeIndex, pathname]);

  useEffect(() => {
    const el = indicatorRef.current;
    if (!el || prefersReducedMotion() || !indicator.width) return;
    gsap.to(el, {
      x: indicator.left,
      width: indicator.width,
      duration: 0.28,
      ease: "power2.out",
    });
  }, [indicator.left, indicator.width]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1 scrollbar-none",
        className
      )}
      aria-label="Studio sections"
    >
      <span
        ref={indicatorRef}
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 rounded-xl bg-[var(--accent)] motion-reduce:transition-transform",
          prefersReducedMotion() ? STUDIO_TRANSITION.panel : ""
        )}
        style={{
          width: indicator.width || 0,
          transform: prefersReducedMotion() ? `translateX(${indicator.left}px)` : undefined,
          opacity: indicator.width ? 1 : 0,
        }}
        aria-hidden
      />
      {CONTENT_STUDIO_TABS.map((tab) => {
        const active = tab.match(pathname);
        const locked =
          studioLocked &&
          (tab.href.includes("/images") || tab.href.includes("/copy") || tab.href.includes("/video"));
        const href = locked ? "/pricing?locked=1" : tab.href;
        const Icon = TAB_ICONS[tab.label as keyof typeof TAB_ICONS] ?? Grid3X3;
        const creditHint = TAB_CREDITS[tab.label];

        return (
          <Link
            key={tab.href}
            href={href}
            data-studio-tab
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative z-10 flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors min-h-11",
              STUDIO_TRANSITION.micro,
              active ? "text-white" : "text-[var(--muted-fg)] hover:text-[var(--foreground)]",
              locked && "opacity-60"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.label}
            {creditHint && !active ? (
              <span className="hidden sm:inline-flex">
                <CreditChip credits={creditHint} className="ml-1 border-transparent bg-transparent opacity-0 group-hover:opacity-100" />
              </span>
            ) : null}
            {"badge" in tab && tab.badge ? (
              <span className="rounded-full bg-[var(--warning-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
