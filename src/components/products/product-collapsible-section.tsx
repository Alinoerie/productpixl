"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductCollapsibleSection({
  id,
  title,
  description,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left md:px-6"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <div>
          <h2 className="font-serif text-lg">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[var(--muted-fg)]">{description}</p> : null}
        </div>
        <ChevronDown
          className={cn("mt-1 h-5 w-5 shrink-0 text-[var(--muted-fg)] transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div id={`${id}-panel`} className="space-y-6 border-t border-[var(--border)] px-4 pb-6 pt-4 md:px-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}
