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
    label: "Pixii Growth",
    value: "€207/mo",
    sub: "~20 listings · €2,484/year locked in",
    highlight: false,
    muted: true,
  },
  {
    label: "ProductPixl",
    value: "Pay per run",
    sub: "Credits required shown before generate — scales with images & detail",
    highlight: true,
  },
] as const;

export function PricingComparison({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">How credits compare</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
            Pay only when you generate — a 12-SKU catalog at 2 runs each is a fraction of Pixii&apos;s annual lock-in.
          </p>
        </div>
        <Badge variant="outline" className="border-[var(--success-border)] text-[var(--success)]">
          ~97% cheaper at catalog scale
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
              <Badge className="absolute -top-2.5 left-4 bg-[var(--accent)]">Best for sellers</Badge>
            ) : null}
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">{row.label}</p>
            <p className={cn("mt-1 font-serif text-2xl", row.highlight && "text-[var(--accent)]")}>{row.value}</p>
            <p className="mt-1 text-xs text-[var(--muted-fg)]">{row.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-[var(--muted-fg)]">
        {checkoutEnabled
          ? "Secure checkout via Stripe. Credits are added instantly after payment."
          : "Stripe checkout is a placeholder for now — packs and prices are shown for reference until billing launches."}
      </p>
    </div>
  );
}
