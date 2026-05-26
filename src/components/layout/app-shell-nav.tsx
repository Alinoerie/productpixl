"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ClipboardCheck,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutGrid,
  MoreHorizontal,
  Palette,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Studio", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/generate", label: "Images", icon: Camera },
  { href: "/copy", label: "Copy", icon: FileText },
  { href: "/grader", label: "Grader", icon: ClipboardCheck },
  { href: "/brand", label: "Brand", icon: Palette },
  { href: "/pricing", label: "Credits", icon: CreditCard },
  { href: "/account", label: "Account", icon: User },
];

const mobileNav = nav.filter((item) =>
  ["/dashboard", "/projects", "/generate", "/copy"].includes(item.href)
);

const moreLinks = [
  { href: "/grader", label: "Grader", icon: ClipboardCheck },
  { href: "/brand", label: "Brand", icon: Palette },
  { href: "/pricing", label: "Credits", icon: CreditCard },
  { href: "/account", label: "Account", icon: User },
];

function isActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/projects" &&
      (pathname.startsWith("/projects") || pathname.startsWith("/products"))) ||
    (href !== "/projects" && pathname.startsWith(href))
  );
}

export function AppShellNav({
  className,
  studioLocked = false,
}: {
  className?: string;
  studioLocked?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex max-w-[min(100%,42rem)] items-center gap-1 overflow-x-auto scrollbar-none", className)}
      aria-label="Studio navigation"
    >
      {nav.map((item) => {
        const locked =
          studioLocked && (item.href === "/generate" || item.href === "/copy");
        const href = locked ? "/pricing?locked=1" : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            aria-disabled={locked || undefined}
            title={locked ? "Buy credits to unlock" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              locked && "opacity-60",
              isActive(pathname, item.href)
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMoreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const moreActive = moreLinks.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      {open ? (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 w-44 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-[var(--shadow-md)]"
          role="menu"
          aria-label="More studio links"
        >
          {moreLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:bg-[var(--muted)]"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More"
        title="More"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
          open || moreActive ? "text-[var(--accent)]" : "text-[var(--muted-fg)]"
        )}
      >
        <MoreHorizontal className={cn("h-5 w-5", (open || moreActive) && "stroke-[2.5px]")} strokeWidth={1.5} />
        <span>More</span>
      </button>
    </div>
  );
}

export function AppShellMobileNav({ studioLocked = false }: { studioLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Mobile studio navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item.href);
          const locked =
            studioLocked && (item.href === "/generate" || item.href === "/copy");
          const href = locked ? "/pricing?locked=1" : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              aria-disabled={locked || undefined}
              title={locked ? "Buy credits to unlock" : item.label}
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                locked && "opacity-60",
                active ? "text-[var(--accent)]" : "text-[var(--muted-fg)]"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} strokeWidth={1.5} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <MobileMoreMenu />
      </div>
    </nav>
  );
}
