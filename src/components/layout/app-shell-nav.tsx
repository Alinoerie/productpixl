"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, ClipboardCheck, CreditCard, FileText, FolderOpen, LayoutGrid, Palette, User } from "lucide-react";
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
  ["/dashboard", "/projects", "/generate", "/copy", "/grader"].includes(item.href)
);

function isActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/projects" &&
      (pathname.startsWith("/projects") || pathname.startsWith("/products"))) ||
    (href !== "/projects" && pathname.startsWith(href))
  );
}

export function AppShellNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex max-w-[min(100%,42rem)] items-center gap-1 overflow-x-auto scrollbar-none", className)}
      aria-label="Studio navigation"
    >
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            isActive(pathname, item.href)
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShellMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Mobile studio navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-[var(--accent)]" : "text-[var(--muted-fg)]"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} strokeWidth={1.5} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
