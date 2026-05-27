import { cn } from "@/lib/utils";

export function MarketingSection({
  children,
  className,
  scroll = true,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-m-scroll={scroll ? "" : undefined}
      className={cn(scroll && "will-change-transform", className)}
    >
      {children}
    </section>
  );
}

export function MarketingStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-m-stagger className={className}>
      {children}
    </div>
  );
}

export function MarketingStaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-m-item className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

export function MarketingCtaBand({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <MarketingSection className={cn("px-4 py-16", className)}>
      <div
        data-m-scroll
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-10"
      >
        <div>
          <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
          {description ? <p className="mt-2 text-sm text-[var(--muted-fg)]">{description}</p> : null}
        </div>
        <div className="m-action flex flex-wrap gap-3">{actions}</div>
      </div>
    </MarketingSection>
  );
}

export function MarketingInkBand({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <MarketingSection className={cn("px-4 py-16", className)}>
      <div
        data-m-scroll
        className="mx-auto max-w-3xl rounded-2xl bg-[var(--ink)] p-8 text-center text-white md:p-12"
      >
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
        {description ? <p className="mx-auto mt-3 max-w-lg text-white/70">{description}</p> : null}
        <div className="m-action mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </MarketingSection>
  );
}
