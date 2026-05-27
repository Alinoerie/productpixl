"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Camera,
  Copy,
  FileText,
  FolderOpen,
  Layers,
  LayoutGrid,
  Palette,
  PenLine,
  Sparkles,
  Tag,
  Wand2,
  Plug,
} from "lucide-react";
import type { BrandSummary } from "@/lib/brands";
import { BrandSwitcher } from "@/components/layout/brand-switcher";
import { CreditBadge } from "@/components/layout/credit-badge";
import { ProductPixlLogo, ProductPixlWordmark } from "@/components/brand/productpixl-logo";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Sparkles; lockable?: boolean; hint?: string };

const createNav: NavItem[] = [
  {
    href: STUDIO_ROUTES.home,
    label: "Content studio",
    icon: PenLine,
    hint: "Images, copy, and recent work",
  },
  {
    href: STUDIO_ROUTES.aplus,
    label: "A+ content",
    icon: LayoutGrid,
    hint: "Enhanced brand content modules",
  },
  {
    href: STUDIO_ROUTES.images,
    label: "Images",
    icon: Camera,
    lockable: true,
  },
  {
    href: STUDIO_ROUTES.copy,
    label: "Copy",
    icon: Copy,
    lockable: true,
  },
];

const batchNav: NavItem[] = [
  { href: "/batch/listing-builder", label: "Listing builder", icon: Layers },
  { href: "/batch/copy", label: "Copy builder", icon: FileText },
  { href: "/batch/clone", label: "Clone catalog", icon: Copy },
];

const integrationsNav: NavItem[] = [
  { href: "/integrations/amazon", label: "Amazon", icon: Plug },
  { href: "/integrations/shopify", label: "Shopify", icon: Plug },
  { href: "/integrations/zapier", label: "Zapier & Make", icon: Plug },
];

const brandNav: NavItem[] = [
  {
    href: STUDIO_ROUTES.brandProfile,
    label: "Brand kit",
    icon: Palette,
    hint: "Colors, voice, and rules for listings",
  },
  { href: STUDIO_ROUTES.brandsList, label: "All brands", icon: Tag },
];

const playbookNav: NavItem[] = [
  { href: STUDIO_ROUTES.playbooks, label: "Expert playbooks", icon: Sparkles },
  { href: STUDIO_ROUTES.myPlaybooks, label: "My playbooks", icon: BookOpen },
];

const libraryNav: NavItem[] = [
  { href: STUDIO_ROUTES.templates, label: "Visual templates", icon: Wand2 },
  {
    href: STUDIO_ROUTES.projects,
    label: "Projects",
    icon: FolderOpen,
    hint: "All products and listing runs",
  },
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
  onNavigate,
  studioLocked,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  studioLocked?: boolean;
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
        const locked = studioLocked && item.lockable;
        const href = locked ? "/pricing?locked=1" : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            title={item.hint ?? item.label}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              locked && "opacity-60"
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

export function SidebarNavContent({
  brands,
  activeBrandId,
  initialCredits,
  projectCount = 0,
  collapsed = false,
  showHeader = true,
  onNavigate,
  studioLocked,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  initialCredits: number;
  projectCount?: number;
  collapsed?: boolean;
  showHeader?: boolean;
  onNavigate?: () => void;
  studioLocked?: boolean;
}) {
  const pathname = usePathname();
  const showAdvancedNav = projectCount > 0;

  return (
    <>
      {showHeader ? (
        <div className={cn("border-b border-[var(--border)] p-4", collapsed && "px-3")}>
          <Link
            href={STUDIO_ROUTES.home}
            onClick={onNavigate}
            className={cn("flex items-center gap-2", collapsed && "justify-center")}
          >
            {collapsed ? (
              <ProductPixlLogo size={44} />
            ) : (
              <ProductPixlWordmark size={44} textClassName="text-lg" />
            )}
          </Link>
          <div className={cn("mt-4", collapsed && "mt-3 flex justify-center")}>
            <BrandSwitcher brands={brands} activeBrandId={activeBrandId} collapsed={collapsed} />
          </div>
        </div>
      ) : null}

      <nav className="flex-1 space-y-6 overflow-y-auto p-3" aria-label="Studio navigation">
        {/* Create nav lives in the bottom bar on mobile — not duplicated here */}
        <NavSection title="Brand" items={brandNav} pathname={pathname} collapsed={false} onNavigate={onNavigate} />
        {showAdvancedNav ? (
          <>
            <NavSection title="Batch" items={batchNav} pathname={pathname} collapsed={false} onNavigate={onNavigate} />
            <NavSection
              title="Playbooks"
              items={playbookNav}
              pathname={pathname}
              collapsed={false}
              onNavigate={onNavigate}
            />
            <NavSection
              title="Integrations"
              items={integrationsNav}
              pathname={pathname}
              collapsed={false}
              onNavigate={onNavigate}
            />
          </>
        ) : null}
        <NavSection title="Library" items={libraryNav} pathname={pathname} collapsed={false} onNavigate={onNavigate} />
      </nav>

      <div className={cn("space-y-2 border-t border-[var(--border)] p-3", collapsed && "px-2")}>
        {!collapsed ? <CreditBadge initialCredits={initialCredits} /> : null}
        {!collapsed ? (
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href={STUDIO_ROUTES.pricing}
              onClick={onNavigate}
              className="flex min-h-11 items-center rounded-lg px-3 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              Pricing
            </Link>
            <Link
              href={STUDIO_ROUTES.account}
              onClick={onNavigate}
              className="flex min-h-11 items-center rounded-lg px-3 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              Account
            </Link>
            <Link
              href="/account?invite=1"
              onClick={onNavigate}
              className="flex min-h-11 items-center rounded-lg px-3 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              Invite friends
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
