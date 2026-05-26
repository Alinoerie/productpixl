import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const packs = [
  { name: "Starter", credits: 10, price: "€29", per: "€2.90", tag: null },
  { name: "Growth", credits: 30, price: "€79", per: "€2.63", tag: "Best value" },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="border-y border-[var(--border)] bg-[var(--muted)]/20 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Pricing</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Credits that scale with your catalog</h2>
          <p className="mt-4 text-[var(--muted-fg)]">
            No $207/mo subscription. Buy credit packs when you need more — each studio run shows credits required
            before you generate. Sign in for 10 free credits.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {packs.map((p) => (
            <Card
              key={p.name}
              className={
                p.tag
                  ? "relative border-[var(--accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--accent)]/20"
                  : ""
              }
            >
              {p.tag ? <Badge className="absolute -top-2.5 right-4">{p.tag}</Badge> : null}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <CreditCard className="h-5 w-5 text-[var(--muted-fg)]" strokeWidth={1.5} />
                </CardTitle>
                <p className="font-serif text-4xl">{p.price}</p>
                <p className="text-sm text-[var(--muted-fg)]">{p.credits} credits in pack</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    {p.credits} generation credits
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    Use across image & copy runs (totals vary per project)
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/login">Sign in — 10 free credits</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href="/pricing">View full pricing & calculator</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
