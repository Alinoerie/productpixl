import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const rows = [
  {
    label: "Traditional photoshoot",
    value: "€500–5,000",
    sub: "Per SKU · weeks of lead time",
    highlight: false,
  },
  {
    label: "Fixed SaaS subscription",
    value: "~€200+/mo",
    sub: "Annual lock-in · listing caps",
    highlight: false,
    muted: true,
  },
  {
    label: "ProductPixl credits",
    value: "Pay per run",
    sub: "See the exact total before each generate · top up with packs",
    highlight: true,
  },
] as const;

export function PricingComparison() {
  return (
    <section aria-labelledby="compare-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="compare-heading" className="font-serif text-xl">
            Why credits instead of subscriptions?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
            You are not locked into a monthly listing cap. Buy credits when you ship new SKUs — idle months cost
            nothing beyond your balance.
          </p>
        </div>
        <Badge variant="outline" className="border-[var(--success-border)] text-[var(--success)]">
          No monthly minimum today
        </Badge>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              "relative rounded-xl p-4 transition-shadow",
              row.highlight
                ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-[var(--shadow-md)] ring-1 ring-[var(--accent)]/20"
                : "border border-[var(--border)] bg-[var(--muted)]/60",
              "muted" in row && row.muted && !row.highlight && "opacity-90"
            )}
          >
            {row.highlight ? (
              <Badge className="absolute -top-2.5 left-4 bg-[var(--accent)]">ProductPixl</Badge>
            ) : null}
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">{row.label}</p>
            <p className={cn("mt-1 font-serif text-2xl", row.highlight && "text-[var(--accent)]")}>{row.value}</p>
            <p className="mt-1 text-xs text-[var(--muted-fg)]">{row.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
