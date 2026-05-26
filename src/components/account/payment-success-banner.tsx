"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PaymentSuccessBanner() {
  useEffect(() => {
    window.dispatchEvent(new Event("credits-updated"));
  }, []);

  return (
    <div
      className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-bg)] px-4 py-4 text-sm text-[var(--success)]"
      role="status"
    >
      <p className="font-medium">Payment successful — credits added to your balance.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" className="bg-[var(--success)] text-white hover:opacity-90">
          <Link href="/generate">Open image studio</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-[var(--success)]/30 bg-transparent">
          <Link href="/projects">View projects</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="text-[var(--success)]">
          <Link href="/pricing">Credit packs</Link>
        </Button>
      </div>
    </div>
  );
}
