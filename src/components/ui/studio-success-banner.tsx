"use client";

import type { ReactNode, RefObject } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudioSuccessBanner({
  title,
  description,
  children,
  className,
  innerRef,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  innerRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      role="status"
      className={cn(
        "scroll-mt-24 rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)]/40 p-5 animate-fade-up",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="studio-success-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/15">
          <Check className="h-5 w-5 text-[var(--success)]" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          {description ? <p className="mt-1 text-sm text-[var(--muted-fg)]">{description}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
