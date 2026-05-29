"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Wraps children in a fade-up animation.
 * Called once per page mount — add to layout.tsx main area.
 */
export function FadeUp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
