"use client";

import { cn } from "@/lib/utils";
import { splitTitleWords, useMarketingHeroMotion } from "@/hooks/use-marketing-gsap";

export function MarketingHero({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useMarketingHeroMotion([title, eyebrow, description]);
  const centered = align === "center";

  return (
    <section
      ref={ref}
      className={cn(
        "relative px-4 py-16 md:py-20",
        "[visibility:hidden]",
        "motion-reduce:visible motion-reduce:[visibility:visible]",
        className
      )}
    >
      <div className={cn("mx-auto max-w-6xl", centered && "max-w-3xl text-center")}>
        <span
          className="m-accent-line mb-6 block h-px w-16 bg-gradient-to-r from-[var(--accent)] to-transparent motion-reduce:hidden"
          aria-hidden
        />
        {eyebrow ? (
          <p className="m-eyebrow text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn("mt-3 font-serif text-4xl leading-[1.08] md:text-5xl", centered && "mx-auto max-w-3xl")}>
          {splitTitleWords(title)}
        </h1>
        {description ? (
          <p
            className={cn(
              "m-body mt-4 max-w-2xl text-lg text-[var(--muted-fg)]",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
        {actions ? (
          <div className={cn("m-action mt-8 flex flex-wrap gap-3", centered && "justify-center")}>{actions}</div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
