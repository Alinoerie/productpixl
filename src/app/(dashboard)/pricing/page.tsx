import { Check, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/pricing/checkout-button";

const packs = [
  {
    key: "starter" as const,
    name: "Starter",
    credits: 10,
    price: "€29",
    per: "€2.90",
    tag: null,
  },
  {
    key: "growth" as const,
    name: "Growth",
    credits: 30,
    price: "€79",
    per: "€2.63",
    tag: "Best value",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <Badge variant="outline" className="mb-4 border-[var(--accent)]/30 text-[var(--accent)]">
          Pay per generation
        </Badge>
        <h1 className="font-serif text-3xl md:text-4xl">Credits that scale with your catalog</h1>
        <p className="mt-4 text-[var(--muted-fg)]">
          No $207/mo subscription like Pixii. One credit = one full image pipeline (L1 + L3 + L4) or one listing
          copy run. Buy when you need more — credits do not expire on a monthly clock.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {packs.map((p) => (
          <Card
            key={p.key}
            className={
              p.tag
                ? "relative border-[var(--accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--accent)]/20"
                : ""
            }
          >
            {p.tag ? (
              <Badge className="absolute -top-2.5 right-4">{p.tag}</Badge>
            ) : null}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.name}</span>
                <CreditCard className="h-5 w-5 text-[var(--muted-fg)]" strokeWidth={1.5} />
              </CardTitle>
              <p className="font-serif text-4xl">{p.price}</p>
              <p className="text-sm text-[var(--muted-fg)]">{p.per} per credit</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {p.credits} generation credits
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  Image pipeline or copy per credit
                </li>
              </ul>
              <CheckoutButton packageKey={p.key} label={`Buy ${p.name}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-xl">How credits compare</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Traditional photoshoot", value: "€500–5,000", sub: "per SKU" },
            { label: "Pixii Growth", value: "€207/mo", sub: "~20 listings" },
            { label: "ProductPixl", value: "1 credit", sub: "per full image run" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl bg-[var(--muted)]/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">
                {row.label}
              </p>
              <p className="mt-1 font-serif text-2xl">{row.value}</p>
              <p className="text-xs text-[var(--muted-fg)]">{row.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--muted-fg)]">
          Stripe checkout is available when billing is enabled. Until then, use your 10 free signup credits to
          test the full pipeline.
        </p>
      </div>
    </div>
  );
}
