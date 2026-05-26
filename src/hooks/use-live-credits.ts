"use client";

import { useEffect, useState } from "react";

export function useLiveCredits(initialCredits: number) {
  const [credits, setCredits] = useState(initialCredits);

  useEffect(() => {
    setCredits(initialCredits);
  }, [initialCredits]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (res.ok && typeof data.credits === "number") setCredits(data.credits);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("credits-updated", refresh);
    return () => window.removeEventListener("credits-updated", refresh);
  }, []);

  return [credits, setCredits] as const;
}
