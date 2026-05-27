"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import type { BrandSummary } from "@/lib/brands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function BrandSwitcherPill({
  brands,
  activeBrandId,
  activeBrandName,
  primaryColor,
}: {
  brands: BrandSummary[];
  activeBrandId: string;
  activeBrandName: string;
  primaryColor: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function switchBrand(brandId: string) {
    if (brandId === activeBrandId) {
      setOpen(false);
      return;
    }
    await fetch("/api/brands/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    startTransition(() => {
      router.refresh();
      setOpen(false);
    });
  }

  const initial = (activeBrandName || "B").charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="inline-flex max-w-[min(100%,240px)] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 text-sm shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {initial}
        </span>
        <span className="truncate font-medium">{activeBrandName || "Select brand"}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--muted-fg)] transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,280px)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)]">
          <div className="border-b border-[var(--border)] p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-fg)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands…"
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto p-1" role="listbox">
            {filtered.map((brand) => {
              const active = brand.id === activeBrandId;
              return (
                <li key={brand.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => void switchBrand(brand.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--muted)]",
                      active && "bg-[var(--accent-soft)]/60"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        active ? "bg-[var(--accent)]" : "bg-transparent ring-1 ring-[var(--border)]"
                      )}
                    />
                    <span className="flex-1 truncate">{brand.name}</span>
                    {active ? <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--border)] p-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
              <Link href="/brands/new" onClick={() => setOpen(false)}>
                <Plus className="h-4 w-4" />
                New brand
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
