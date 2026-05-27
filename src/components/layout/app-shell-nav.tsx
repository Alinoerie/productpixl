"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, FileText, FolderOpen, Menu, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

const navItems = [
  { href: STUDIO_ROUTES.home, label: "Home", icon: PenLine, matchHome: true },
  { href: STUDIO_ROUTES.projects, label: "Projects", icon: FolderOpen },
  { href: STUDIO_ROUTES.images, label: "Images", icon: Camera, lockable: true },
  { href: STUDIO_ROUTES.copy, label: "Copy", icon: FileText, lockable: true },
] as const;

function isNavActive(pathname: string, href: string, matchHome?: boolean) {
  if (matchHome) {
    return pathname === STUDIO_ROUTES.home || pathname.startsWith("/studio/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShellNav({ studioLocked = false }: { studioLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Studio">
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href, "matchHome" in item ? item.matchHome : false);
        const locked = studioLocked && "lockable" in item && item.lockable;
        const href = locked ? "/pricing?locked=1" : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              locked && "opacity-60"
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShellBottomNav({
  studioLocked = false,
  onOpenMenu,
}: {
  studioLocked?: boolean;
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Studio mobile"
      style={{ ["--mobile-nav-offset" as string]: "calc(4.5rem + env(safe-area-inset-bottom))" }}
    >
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href, "matchHome" in item ? item.matchHome : false);
        const locked = studioLocked && "lockable" in item && item.lockable;
        const href = locked ? "/pricing?locked=1" : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium",
              active ? "text-[var(--accent)]" : "text-[var(--muted-fg)]",
              locked && "opacity-60"
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-[var(--muted-fg)]"
        aria-label="Open full menu"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
        More
      </button>
    </nav>
  );
}
