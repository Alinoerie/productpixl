"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MKT_DURATION, MKT_EASE } from "@/lib/marketing-motion";
import { prefersReducedMotion } from "@/hooks/use-studio-gsap";

let scrollTriggerRegistered = false;

export function registerMarketingGsap() {
  if (typeof window === "undefined" || scrollTriggerRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

/** Page-level scroll orchestration — attach via MarketingMotionProvider. */
export function useMarketingPageMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerMarketingGsap();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-m-scroll]").forEach((el) => {
        gsap.from(el, {
          y: 56,
          opacity: 0,
          filter: "blur(10px)",
          duration: MKT_DURATION.section,
          ease: MKT_EASE.out,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-m-stagger]").forEach((container) => {
        const items = container.querySelectorAll("[data-m-item]");
        if (!items.length) return;
        gsap.from(items, {
          y: 40,
          opacity: 0,
          scale: 0.96,
          rotateX: 6,
          transformPerspective: 900,
          duration: MKT_DURATION.card,
          stagger: 0.09,
          ease: MKT_EASE.out,
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-m-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.4,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-m-float]").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 2.8 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    });

    return () => ctx.revert();
  }, []);
}

/** Hero entrance — call from MarketingHero via layout effect. */
export function useMarketingHeroMotion(deps: unknown[] = []) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    registerMarketingGsap();

    const eyebrow = root.querySelector(".m-eyebrow");
    const titleWords = root.querySelectorAll(".m-title-word");
    const body = root.querySelector(".m-body");
    const actions = root.querySelectorAll(".m-action");
    const accent = root.querySelector(".m-accent-line");

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });
      const tl = gsap.timeline({ defaults: { ease: MKT_EASE.out } });

      if (accent) {
        tl.fromTo(accent, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.8 });
      }
      if (eyebrow) {
        tl.from(eyebrow, { y: 24, opacity: 0, filter: "blur(8px)", duration: 0.55 }, accent ? "-=0.45" : 0);
      }
      if (titleWords.length) {
        tl.from(
          titleWords,
          { yPercent: 110, opacity: 0, rotate: 2, duration: 0.72, stagger: 0.035 },
          "-=0.35"
        );
      }
      if (body) {
        tl.from(body, { y: 28, opacity: 0, filter: "blur(6px)", duration: 0.65 }, "-=0.4");
      }
      if (actions.length) {
        tl.from(
          actions,
          { y: 20, opacity: 0, scale: 0.92, duration: 0.5, stagger: 0.08, ease: MKT_EASE.expo },
          "-=0.3"
        );
      }
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function splitTitleWords(title: string) {
  const words = title.split(/\s+/).filter(Boolean);
  return words.map((word, i) => (
    <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
      <span className="m-title-word inline-block">
        {word}
        {i < words.length - 1 ? "\u00A0" : ""}
      </span>
    </span>
  ));
}
