"use client";

import { useEffect } from "react";
import Link from "next/link";

export function PaymentSuccessBanner() {
  useEffect(() => {
    window.dispatchEvent(new Event("credits-updated"));
  }, []);

  return (
    <p
      className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]"
      role="status"
    >
      Payment successful — credits added to your balance.{" "}
      <Link href="/pricing" className="font-medium underline-offset-2 hover:underline">
        View credit packs
      </Link>
    </p>
  );
}
