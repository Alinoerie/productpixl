"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Copy,
  FolderOpen,
  Layers,
  Palette,
  PenLine,
  Sparkles,
  Tag,
  Wand2,
} from "lucide-react";
import type { BrandSummary } from "@/lib/brands";
import { BrandSwitcher } from "@/components/layout/brand-switcher";
import { CreditBadge } from "@/components/layout/credit-badge";
import { useSidebar } from "@/components/layout/sidebar-context";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Sparkles; locked?: boolean; hint?: string };

const createNav: NavItem[] = [
  {
    href: STUDIO_ROUTES.home,
    label: "Content studio",
    icon: PenLine,
    hint: "Images, copy, and recent work",
  },
];

const batchNav: NavItem[] = [
  { href: "/batch/listing-builder", label: "Listing builder", icon: Layers },
  { href: "/batch/clone", label: "Clone catalog", icon: Copy },
];

const brandNav: NavItem[] = [
  { href: STUDIO_ROUTES.brandProfile, label: "Brand kit", icon: Palette, hint: "Colors, voice, and rules for listings" },
  { href: STUDIO_ROUTES.brandsList, label: "All brands", icon: Tag },
];

const playbookNav: NavItem[] = [
  { href: STUDIO_ROUTES.playbooks, label: "Expert playbooks", icon: Sparkles },
  { href: STUDIO_ROUTES.myPlaybooks, label: "My playbooks", icon: BookOpen },
];

const libraryNav: NavItem[] = [
  { href: STUDIO_ROUTES.templates, label: "Visual templates", icon: Wand2 },
  { href: STUDIO_ROUTES.projects, label: "Projects", icon: FolderOpen, hint: "All products and listing runs" },
];

function isActive(pathname: string, href: string) {
  if (href === STUDIO_ROUTES.home) {
    return pathname === STUDIO_ROUTES.home || pathname.startsWith("/studio/");
  }
  if (href === STUDIO_ROUTES.brandProfile) {
    return pathname === STUDIO_ROUTES.brandProfile;
  }
  if (href === STUDIO_ROUTES.brandsList) {
    return pathname === STUDIO_ROUTES.brandsList || pathname.startsWith("/brands/");
  }
  if (href === STUDIO_ROUTES.projects) {
    return pathname === STUDIO_ROUTES.projects || pathname.startsWith("/products/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  items,
  pathname,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-1">
      {!collapsed ? (
        <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-fg)]">
          {title}
        </p>
      ) : null}
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const href = item.locked ? "/pricing?locked=1" : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            title={item.hint ?? item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              item.locked && "opacity-60"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  brands,
  activeBrandId,
  initialCredits,
  studioLocked,
  projectCount = 0,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  initialCredits: number;
  studioLocked: boolean;
  projectCount?: number;
}) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  void studioLocked;
  const showAdvancedNav = projectCount > 0;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className={cn("border-b border-[var(--border)] p-4", collapsed && "px-3")}>
        <Link href={STUDIO_ROUTES.home} className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-[10px] font-bold text-white">
            Px
          </span>
          {!collapsed ? <span className="font-serif text-lg">ProductPixl</span> : null}
        </Link>
        <div className={cn("mt-4", collapsed && "mt-3 flex justify-center")}>
          <BrandSwitcher brands={brands} activeBrandId={activeBrandId} collapsed={collapsed} />
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3" aria-label="Studio sidebar">
        <NavSection title="Create" items={createNav} pathname={pathname} collapsed={collapsed} />
        <NavSection title="Brand" items={brandNav} pathname={pathname} collapsed={collapsed} />
        {showAdvancedNav ? (
          <>
            <NavSection title="Batch" items={batchNav} pathname={pathname} collapsed={collapsed} />
            <NavSection title="Playbooks" items={playbookNav} pathname={pathname} collapsed={collapsed} />
          </>
        ) : null}
        <NavSection title="Library" items={libraryNav} pathname={pathname} collapsed={collapsed} />
      </nav>

      <div className={cn("space-y-2 border-t border-[var(--border)] p-3", collapsed && "px-2")}>
        {!collapsed ? <CreditBadge initialCredits={initialCredits} /> : null}
        {!collapsed ? (
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href={STUDIO_ROUTES.pricing}
              className="rounded-lg px-3 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              Pricing
            </Link>
            <Link
              href={STUDIO_ROUTES.account}
              className="rounded-lg px-3 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              Account
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
