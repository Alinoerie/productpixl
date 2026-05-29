"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LanguageFlag } from "@/components/brand/brand-kit/language-flags";
import { useBrandStore } from "@/stores/brand-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BrandContextStrip({
  brands,
  activeBrandId,
  className,
}: {
  brands: { id: string; name: string }[];
  activeBrandId: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const profile = useBrandStore((s) => s.profile);
  const primary = profile.primaryColor ?? "#F59E0B";
  const name = profile.brandName ?? profile.displayName ?? "Your brand";
  const lang = profile.language ?? "en";

  async function cycleBrand() {
    if (brands.length < 2) {
      router.push("/brands");
      return;
    }
    const idx = brands.findIndex((b) => b.id === activeBrandId);
    const next = brands[(idx + 1) % brands.length];
    await fetch("/api/brands/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: next.id }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={cn(
        "flex h-8 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 text-xs",
        className
      )}
      style={{
        ["--brand-primary" as string]: primary,
      }}
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
      <span className="truncate font-medium">{name}</span>
      <LanguageFlag code={lang} className="h-2.5 w-4 shrink-0 rounded-sm" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-6 px-2 text-[11px] text-[var(--muted-fg)]"
        disabled={pending}
        onClick={() => void cycleBrand()}
      >
        Switch
      </Button>
    </div>
  );
}
