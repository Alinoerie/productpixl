"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PRICING_FAQ } from "@/lib/pricing-plans";
import { cn } from "@/lib/utils";

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="pricing-faq-heading" className="space-y-6">
      <div>
        <h2 id="pricing-faq-heading" className="font-serif text-2xl md:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-fg)]">Everything you need to know about plans and credits.</p>
      </div>
      <div className="space-y-3">
        {PRICING_FAQ.map((item, index) => {
          const open = openIndex === index;
          const panelId = `pricing-faq-panel-${index}`;
          const buttonId = `pricing-faq-button-${index}`;
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
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                onClick={() => setOpenIndex(open ? null : index)}
              >
                {item.q}
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-[var(--muted-fg)] transition-transform", open && "rotate-180")}
                  aria-hidden
                />
              </button>
              {open ? (
                <p
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--muted-fg)]"
                >
                  {item.q.includes("Enterprise") ? (
                    <>
                      {item.a}{" "}
                      <Link href="/demo" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                        Book a demo →
                      </Link>
                    </>
                  ) : (
                    item.a
                  )}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
