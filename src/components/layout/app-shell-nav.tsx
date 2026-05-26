"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Studio" },
  { href: "/generate", label: "Images" },
  { href: "/copy", label: "Copy" },
  { href: "/brand", label: "Brand" },
  { href: "/pricing", label: "Credits" },
  { href: "/account", label: "Account" },
];

export function AppShellNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === "/dashboard" && pathname.startsWith("/products")) ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
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

export function AppShellMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto border-t border-[var(--border)] bg-[var(--card)]/80 px-3 py-2.5 md:hidden">
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === "/dashboard" && pathname.startsWith("/products")) ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
