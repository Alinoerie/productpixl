"use client";

import { cn } from "@/lib/utils";

export function StudioPreview({
  title = "Preview",
  children,
  className,
  sticky = true,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}) {
  return (
    <aside
      className={cn(
        sticky && "xl:sticky xl:top-[9.5rem]",
        className
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]">
        <div className="border-b border-[var(--border)] px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">{title}</p>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </aside>
  );
}
