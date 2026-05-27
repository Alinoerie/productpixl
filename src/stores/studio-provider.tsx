"use client";

import { useEffect } from "react";
import { useBrandStore } from "@/stores/brand-store";

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useBrandStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return children;
}
