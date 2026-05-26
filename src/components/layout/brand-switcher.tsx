"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import type { BrandSummary } from "@/lib/brands";
import { cn } from "@/lib/utils";

export function BrandSwitcher({
  brands,
  activeBrandId,
  collapsed = false,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  collapsed?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = brands.find((b) => b.id === activeBrandId) ?? brands[0];

  async function onChange(brandId: string) {
    if (brandId === activeBrandId) return;
    await fetch("/api/brands/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    startTransition(() => router.refresh());
  }

  if (collapsed) {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]"
        title={active?.name ?? "Brand"}
      >
        {(active?.name ?? "B").slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-fg)]">Brand</p>
      <div className="relative">
        <select
          value={activeBrandId}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-3 pr-9 text-sm font-medium",
            "focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          )}
          aria-label="Select brand"
        >
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
              {brand.isDefault ? " (default)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-fg)]" />
      </div>
      <Link
        href="/brands/new"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
      >
        <Plus className="h-3.5 w-3.5" />
        Create new brand
      </Link>
    </div>
  );
}
