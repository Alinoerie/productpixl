"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { BrandSummary } from "@/lib/brands";
import { SidebarNavContent } from "@/components/layout/sidebar-nav-content";
import { Button } from "@/components/ui/button";

export function MobileNavDrawer({
  open,
  onClose,
  brands,
  activeBrandId,
  initialCredits,
  projectCount,
  studioLocked,
}: {
  open: boolean;
  onClose: () => void;
  brands: BrandSummary[];
  activeBrandId: string;
  initialCredits: number;
  projectCount: number;
  studioLocked?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Studio menu">
      <button type="button" className="absolute inset-0 bg-black/40 cursor-default" aria-label="Close menu" onClick={onClose} />
      <aside
        className="absolute bottom-0 left-0 top-0 z-[61] flex w-[min(100%,20rem)] flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <p className="text-sm font-semibold">Menu</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarNavContent
          brands={brands}
          activeBrandId={activeBrandId}
          initialCredits={initialCredits}
          projectCount={projectCount}
          onNavigate={onClose}
          studioLocked={studioLocked}
          collapsed={false}
        />
      </aside>
    </div>
  );
}
