"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, FileText, FolderOpen, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

const navItems = [
  { href: STUDIO_ROUTES.home, label: "Home", icon: PenLine },
  { href: STUDIO_ROUTES.projects, label: "Projects", icon: FolderOpen },
  { href: STUDIO_ROUTES.images, label: "Images", icon: Camera },
  { href: STUDIO_ROUTES.copy, label: "Copy", icon: FileText },
];

const primaryItems = navItems;

export function AppShellNav({ studioLocked = false }: { studioLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Studio">
        {primaryItems.map((item) => {
          const active =
            item.href === STUDIO_ROUTES.home
              ? pathname === STUDIO_ROUTES.home || pathname.startsWith("/studio/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const locked =
            studioLocked && (item.href === STUDIO_ROUTES.images || item.href === STUDIO_ROUTES.copy);
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

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Studio mobile"
      >
        {navItems.map((item) => {
          const active =
            item.href === STUDIO_ROUTES.home
              ? pathname === STUDIO_ROUTES.home || pathname.startsWith("/studio/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const locked =
            studioLocked && (item.href === STUDIO_ROUTES.images || item.href === STUDIO_ROUTES.copy);
          const href = locked ? "/pricing?locked=1" : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                active ? "text-[var(--accent)]" : "text-[var(--muted-fg)]",
                locked && "opacity-60"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
