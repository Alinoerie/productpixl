import { cn } from "@/lib/utils";
import type { BrandSectionId } from "@/components/brand/brand-kit/section-nav";

export function DividerLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">
        {children}
      </span>
      <div className="h-px flex-1 bg-[var(--border)]" aria-hidden />
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[13px] font-medium text-[var(--foreground)]">{children}</label>
      {hint ? <p className="text-xs text-[var(--muted-fg)]">{hint}</p> : null}
    </div>
  );
}

export function SaveChip({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)] animate-in fade-in duration-200">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden />
      Saved
    </span>
  );
}

export function SectionReveal({
  id,
  sectionId,
  children,
  className,
}: {
  id: string;
  sectionId: BrandSectionId;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-brand-section={sectionId}
      className={cn(
        "scroll-mt-24 space-y-6 opacity-0 translate-y-2 transition-all duration-500 ease-out [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0",
        className
      )}
    >
      {children}
    </section>
  );
}
