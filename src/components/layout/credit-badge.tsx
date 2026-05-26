"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { fetchJson } from "@/lib/fetch-json";

export function CreditBadge({ initialCredits }: { initialCredits: number }) {
  const [credits, setCredits] = useState(initialCredits);

  const refresh = useCallback(async () => {
    const { ok, data } = await fetchJson<{ credits?: number }>("/api/credits");
    if (ok && typeof data.credits === "number") {
      setCredits(data.credits);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onCreditsUpdated = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("credits-updated", onCreditsUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("credits-updated", onCreditsUpdated);
    };
  }, [refresh]);

  return (
    <Link href="/pricing" onClick={refresh}>
      <Badge
        variant="outline"
        className="cursor-pointer border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-[var(--accent)]"
      >
        {credits} credits
      </Badge>
    </Link>
  );
}
