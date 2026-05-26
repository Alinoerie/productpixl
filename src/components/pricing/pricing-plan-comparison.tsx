import Link from "next/link";
import {
  PRICING_COMPARISON_GROUPS,
  PRICING_COMPARISON_ROWS,
  PRICING_PLAN_COLUMNS,
  PRICING_VAT_NOTE,
} from "@/lib/pricing-plans";

export function PricingPlanComparison() {
  const columns = PRICING_PLAN_COLUMNS;

  return (
    <section aria-labelledby="compare-plans-heading" className="space-y-6">
      <div>
        <h2 id="compare-plans-heading" className="font-serif text-2xl md:text-3xl">
          Compare plans
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
          Grouped by credits, studio workflows, and support so plan differences are easier to scan.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
              <th scope="col" className="sticky left-0 z-10 min-w-[140px] bg-[var(--muted)]/95 px-4 py-3 font-semibold backdrop-blur-sm">
                Features
              </th>
              {columns.map((col) => (
                <th key={col.id} scope="col" className="min-w-[108px] px-3 py-3 text-center font-semibold">
                  <span className="block">{col.name}</span>
                  {col.popular ? (
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                      Popular
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_COMPARISON_GROUPS.map((group) => {
              const rows = PRICING_COMPARISON_ROWS.filter((r) => r.group === group);
              return rows.flatMap((row, rowIndex) => (
                <tr key={`${group}-${row.label}`} className="border-b border-[var(--border)] last:border-0">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-[var(--card)] px-4 py-3 align-top font-medium backdrop-blur-sm"
                  >
                    {rowIndex === 0 ? (
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-fg)]">
                        {group}
                      </span>
                    ) : null}
                    {row.label}
                    {row.footnote && rowIndex === rows.length - 1 ? (
                      <span className="mt-1 block text-[10px] font-normal text-[var(--muted-fg)]">{row.footnote}</span>
                    ) : null}
                  </th>
                  {columns.map((col) => (
                    <td key={col.id} className="px-3 py-3 text-center text-[var(--muted-fg)]">
                      {row.values[col.id]}
                    </td>
                  ))}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted-fg)]">
        <p>{PRICING_VAT_NOTE}</p>
        <p>
          Questions?{" "}
          <Link href="/demo" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Book a demo
          </Link>{" "}
          or see the{" "}
          <Link href="/faq" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            full FAQ
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
