"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function BrandActivateButton({
  brandId,
  active,
}: {
  brandId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (active) {
    return (
      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
        Active
      </span>
    );
  }

  async function activate() {
    await fetch("/api/brands/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={pending} onClick={activate}>
      {pending ? "Switching…" : "Set active"}
    </Button>
  );
}
