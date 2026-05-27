"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SHOWCASE_HERO_MOSAIC } from "@/lib/showcase";
import { prefersReducedMotion } from "@/hooks/use-studio-gsap";
import { registerMarketingGsap } from "@/hooks/use-marketing-gsap";
import { MKT_DURATION, MKT_EASE } from "@/lib/marketing-motion";

export function ShowcaseMosaic({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    registerMarketingGsap();

    const tiles = root.querySelectorAll("[data-mosaic-tile]");
    const ctx = gsap.context(() => {
      gsap.from(tiles, {
        scale: 0.82,
        opacity: 0,
        y: 24,
        rotate: (i) => (i % 2 === 0 ? -3 : 3),
        duration: MKT_DURATION.card,
        stagger: 0.1,
        ease: MKT_EASE.out,
        delay: 0.35,
      });
      gsap.to(tiles, {
        y: (i) => (i % 2 === 0 ? -6 : 6),
        duration: 3 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.2, from: "random" },
        delay: 1.2,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`grid grid-cols-2 gap-2 sm:gap-3 ${className}`}>
      {SHOWCASE_HERO_MOSAIC.map((item, i) => (
        <div
          key={item.image}
          data-mosaic-tile
          data-m-parallax
          className={`relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-[var(--shadow-md)] ${i === 0 ? "sm:col-span-1" : ""}`}
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 45vw, 240px"
            className="object-cover"
            priority={priority && i < 2}
          />
        </div>
      ))}
    </div>
  );
}
