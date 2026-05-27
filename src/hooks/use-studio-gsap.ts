"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Stagger children in a container — SaaS dashboard weighting: fast, subtle. */
export function useStaggerReveal(
  deps: unknown[] = [],
  options?: { y?: number; duration?: number; stagger?: number; delay?: number }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const targets = el.querySelectorAll("[data-stagger-item]");
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options?.y ?? 12 },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.35,
          stagger: options?.stagger ?? 0.06,
          delay: options?.delay ?? 0,
          ease: "power2.out",
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/** Animate a sliding indicator to new position. */
export function useGsapIndicator(
  indicatorRef: React.RefObject<HTMLElement | null>,
  style: { left: number; width: number },
  deps: unknown[]
) {
  useEffect(() => {
    const el = indicatorRef.current;
    if (!el || prefersReducedMotion() || !style.width) return;

    gsap.to(el, {
      x: style.left,
      width: style.width,
      duration: 0.28,
      ease: "power2.out",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** One-shot entrance for a panel/card. */
export function usePanelEntrance(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
