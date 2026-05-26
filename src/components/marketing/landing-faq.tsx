"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Do I need an Amazon ASIN?",
    a: "No. Upload one product photo — ideal for new launches, private label, and Bol.com before the listing exists.",
  },
  {
    q: "How is this different from Pixii?",
    a: "Pixii starts from an ASIN and costs $207+/mo. ProductPixl is photo-first, pay-per-credit, and includes Bol.com + EU marketplaces.",
  },
  {
    q: "What is RUFUS / COSMO?",
    a: "Amazon's semantic search surfaces. We structure bullets and descriptions so AI shopping assistants can recommend your product — not keyword-stuff.",
  },
  {
    q: "How do credits work?",
    a: "Each studio run shows credits required before you generate. Image runs add up per gallery module plus research and QA depth; copy runs scale with marketplace and product detail. Spot-edits charge per single image.",
  },
  {
    q: "Is Bol.com supported?",
    a: "Yes — select Bol.com in the marketplace picker. Copy uses Dutch-marketplace tone (direct, trustworthy, less hype).",
  },
  {
    q: "What is the free Listing Grader?",
    a: "Paste your title and bullets at /grader for an A–F score and RUFUS tips — no login required. Great lead-in before you generate.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">FAQ</p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">Common questions</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div
                key={item.q}
                className={cn(
                  "rounded-2xl border border-[var(--border)] bg-[var(--card)]",
                  open && "shadow-[var(--shadow-sm)]"
                )}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-semibold"
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  {item.q}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--muted-fg)] transition-transform",
                      open && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <p
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-[var(--border)] px-6 py-4 text-sm leading-relaxed text-[var(--muted-fg)]"
                  >
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
