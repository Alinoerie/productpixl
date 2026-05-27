"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SHOWCASE_CASE_STUDIES, type ShowcaseCaseStudy } from "@/lib/showcase";
import { prefersReducedMotion } from "@/hooks/use-studio-gsap";
import { MKT_DURATION, MKT_EASE } from "@/lib/marketing-motion";

function CaseStudyPanel({ study, panelId }: { study: ShowcaseCaseStudy; panelId: string }) {
  const highlightModules = study.source
    ? study.modules.filter((m) => m.moduleId === "L1" || m.moduleId === "L3")
    : [];

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={`tab-${study.id}`} className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted-fg)]">{study.category}</p>
          <h3 className="mt-1 font-serif text-2xl">{study.product}</h3>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">{study.marketplace}</p>
        </div>
        {study.source ? (
          <Badge variant="outline" className="border-[var(--teal)]/30 bg-[var(--teal-soft)] text-[var(--teal)]">
            1 photo in → {study.modules.length} outputs
          </Badge>
        ) : null}
      </div>

      {study.source ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]">
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="border-b border-[var(--border)] p-4 md:border-b-0 md:border-r">
                <Badge variant="outline" className="mb-3 bg-[var(--card)]/80 text-xs">
                  Before · upload
                </Badge>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--card)]">
                  <Image
                    src={study.source.image}
                    alt={study.source.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-contain p-4"
                  />
                </div>
                <p className="mt-3 text-xs text-[var(--muted-fg)]">{study.source.caption}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3">
                {study.modules.map((mod) => (
                  <div key={mod.moduleId} className="relative aspect-square bg-[var(--card)]">
                    <Image
                      src={mod.image}
                      alt={mod.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <Badge className="bg-[var(--accent)] text-[10px] text-white">
                        {mod.moduleId} · {mod.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlightModules.map((module) => (
              <div
                key={module.moduleId}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]"
              >
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square border-r border-[var(--border)] bg-[var(--card)]">
                    <Image
                      src={study.source!.image}
                      alt={study.source!.alt}
                      fill
                      sizes="200px"
                      className="object-contain p-3"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={module.image}
                      alt={module.alt}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      After · {module.moduleId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3">
                  <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                  <div>
                    <p className="font-semibold">{module.label}</p>
                    <p className="text-xs text-[var(--muted-fg)]">{module.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {study.modules.map((mod) => (
            <div
              key={mod.moduleId}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]"
            >
              <div className="relative aspect-square">
                <Image
                  src={mod.image}
                  alt={mod.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 260px"
                  className="object-cover"
                />
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <Badge className="mb-2 bg-[var(--accent)] text-[10px] text-white">
                  {mod.moduleId}
                </Badge>
                <p className="font-semibold">{mod.label}</p>
                <p className="mt-1 text-xs text-[var(--muted-fg)]">{mod.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LandingGallery() {
  const [activeId, setActiveId] = useState(SHOWCASE_CASE_STUDIES[0].id);
  const active = SHOWCASE_CASE_STUDIES.find((s) => s.id === activeId) ?? SHOWCASE_CASE_STUDIES[0];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 32, scale: 0.98, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: MKT_DURATION.card, ease: MKT_EASE.out }
      );
      gsap.from(panel.querySelectorAll("img"), {
        scale: 1.08,
        opacity: 0.6,
        duration: 0.9,
        stagger: 0.04,
        ease: MKT_EASE.out,
        delay: 0.1,
      });
    }, panel);

    return () => ctx.revert();
  }, [activeId]);

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = SHOWCASE_CASE_STUDIES.length - 1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveId(SHOWCASE_CASE_STUDIES[Math.min(index + 1, last)].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveId(SHOWCASE_CASE_STUDIES[Math.max(index - 1, 0)].id);
    }
  };

  return (
    <section id="gallery" data-m-scroll className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
            Real gallery output
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            From one seller photo to a full gallery
          </h2>
          <p className="mt-4 text-[var(--muted-fg)]">
            These are actual ProductPixl generations — hand soap, skincare,
            and furniture — not placeholder gradients.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Showcase case studies">
          {SHOWCASE_CASE_STUDIES.map((study, index) => {
            const selected = study.id === activeId;
            return (
              <button
                key={study.id}
                id={`tab-${study.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${study.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(study.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-fg)] hover:border-[var(--border-strong)]"
                }`}
              >
                {study.product}
              </button>
            );
          })}
        </div>

        <div ref={panelRef} className="mt-10">
          <CaseStudyPanel study={active} panelId={`panel-${active.id}`} />
        </div>
      </div>
    </section>
  );
}
