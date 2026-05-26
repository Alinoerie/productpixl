"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentSuccessBanner({
  onCreditsUpdated,
}: {
  onCreditsUpdated?: (credits: number) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"confirming" | "ready" | "timeout">("confirming");
  const [balance, setBalance] = useState<number | null>(null);

  const dismiss = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("success");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;

    const confirmCredits = async () => {
      for (let attempt = 0; attempt < 20; attempt++) {
        try {
          const res = await fetch("/api/credits");
          const data = await res.json();
          if (cancelled || !res.ok) break;
          if (typeof data.credits === "number" && data.credits > 0) {
            setBalance(data.credits);
            setPhase("ready");
            window.dispatchEvent(new Event("credits-updated"));
            onCreditsUpdated?.(data.credits);
            return;
          }
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!cancelled) {
        setPhase("timeout");
        window.dispatchEvent(new Event("credits-updated"));
      }
    };

    void confirmCredits();
    return () => {
      cancelled = true;
    };
  }, [onCreditsUpdated]);

  return (
    <div
      className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-bg)] px-4 py-4 text-sm text-[var(--success)]"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {phase === "confirming" ? (
            <>
              <p className="flex items-center gap-2 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming payment…
              </p>
              <p className="mt-1 text-[var(--success)]/80">
                Credits usually appear within a few seconds after checkout.
              </p>
            </>
          ) : phase === "ready" ? (
            <>
              <p className="font-medium">
                Payment successful — {balance} credit{balance === 1 ? "" : "s"} available.
              </p>
              <p className="mt-1 text-[var(--success)]/80">You&apos;re ready to run the studio.</p>
            </>
          ) : (
            <>
              <p className="font-medium">Payment received — credits may take a moment to sync.</p>
              <p className="mt-1 text-[var(--success)]/80">
                Refresh in a few seconds or check your account balance.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md opacity-70 transition hover:opacity-100"
          aria-label="Dismiss payment confirmation"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {phase !== "confirming" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-[var(--success)] text-white hover:opacity-90">
            <Link href={STUDIO_ROUTES.images}>Open images</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-[var(--success)]/30 bg-transparent">
            <Link href="/projects">View projects</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-[var(--success)]">
            <Link href="/account">Account balance</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
