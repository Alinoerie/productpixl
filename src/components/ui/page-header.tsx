import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">{eyebrow}</p>
        ) : null}
        <h1 className={cn("font-serif text-3xl md:text-4xl", eyebrow && "mt-2")}>{title}</h1>
        {description ? <p className="mt-2 text-[var(--muted-fg)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
