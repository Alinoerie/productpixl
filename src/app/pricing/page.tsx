import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { NotifyMeForm } from "@/components/marketing/notify-me-form";

export const metadata: Metadata = {
  title: "Pricing — ProductPixl",
  description: "Simple, transparent pricing. No subscription. Pay only for what you generate.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* SECTION 1: Warning Banner */}
      <div className="border-b border-[var(--border)] bg-amber-900/20">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <p className="flex items-center justify-center gap-2 text-center text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--accent)]">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="font-medium text-amber-400">Generation works today — credit purchases coming soon</span>
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* SECTION 2: Pricing Hero */}
        <header className="text-center">
          <h1 className="font-display text-4xl tracking-tight md:text-5xl lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted-fg)]">
            No subscription. Pay only for what you generate.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-6 py-3">
            <span className="text-3xl font-bold text-[var(--accent)]">€2</span>
            <span className="text-[var(--muted-fg)]">per generation</span>
          </div>
        </header>

        {/* SECTION 3: Credit Pack Cards */}
        <section className="mt-16">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 — Starter */}
            <div className="card-surface group relative overflow-hidden rounded-2xl border border-[var(--border)] p-6 transition-all duration-300 hover:border-[var(--accent)]/30">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-semibold">Starter</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">€29</span>
                    <span className="text-[var(--muted-fg)]">for 10 credits</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-fg)]">~€2.90 per credit</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted-fg)]">10 credit pack</p>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-fg)] focus:border-[var(--accent)]/50 focus:outline-none"
                    />
                  </div>
                  <Button className="btn-primary w-full rounded-xl">
                    Notify me when checkout opens
                  </Button>
                </div>
              </div>
            </div>

            {/* Card 2 — Catalog (Featured) */}
            <div className="card-elevated group relative overflow-hidden rounded-2xl border-2 border-[var(--accent)] p-6 shadow-[0_0_40px_-12px_var(--accent)]/25">
              <div className="absolute top-4 right-4">
                <span className="badge-accent rounded-full px-3 py-1 text-xs font-semibold">Most popular</span>
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-semibold">Catalog</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[var(--accent)]">€79</span>
                    <span className="text-[var(--muted-fg)]">for 30 credits</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-fg)]">~€2.63 per credit</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted-fg)]">30 credit pack</p>
                  <p className="text-sm text-[var(--muted-fg)]">Best value for serious sellers</p>
                </div>
                <div className="mt-auto space-y-3">
                  <NotifyMeForm placeholder="Your email" buttonText="Get free credits" />
                </div>
              </div>
            </div>

            {/* Card 3 — Growth */}
            <div className="card-surface group relative overflow-hidden rounded-2xl border border-[var(--border)] p-6 transition-all duration-300 hover:border-[var(--accent)]/30">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-semibold">Growth</h3>
                  <div className="mt-4">
                    <span className="text-2xl font-bold">Custom pricing</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-fg)]">For teams and high-volume sellers</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted-fg)]">Volume discounts</p>
                  <p className="text-sm text-[var(--muted-fg)]">Dedicated support</p>
                  <p className="text-sm text-[var(--muted-fg)]">Custom integrations</p>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Work email"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-fg)] focus:border-[var(--accent)]/50 focus:outline-none"
                    />
                  </div>
                  <Button variant="outline" className="btn-outline w-full rounded-xl">
                    Contact sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Free Credits Callout */}
        <section className="mt-20 rounded-3xl bg-radial-warm p-12 text-center md:p-16">
          <h2 className="font-display text-3xl md:text-4xl">Start free — 10 credits</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-[var(--muted-fg)]">
            No credit card required. Sign up with Google or email.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="btn-primary rounded-xl text-lg">
              <Link href="/login?callbackUrl=/studio">Get started free</Link>
            </Button>
          </div>
        </section>

        {/* SECTION 5: Feature Comparison Table */}
        <section className="mt-20">
          <h2 className="text-center font-display text-2xl md:text-3xl">Compare plans</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Free</th>
                  <th className="px-6 py-4 text-center font-semibold">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-[var(--accent)]">Catalog</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">Credits</td>
                  <td className="px-6 py-4 text-center text-sm">10</td>
                  <td className="px-6 py-4 text-center text-sm">10</td>
                  <td className="px-6 py-4 text-center text-sm">30</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">Price per generation</td>
                  <td className="px-6 py-4 text-center text-sm">~€2.90</td>
                  <td className="px-6 py-4 text-center text-sm">~€2.90</td>
                  <td className="px-6 py-4 text-center text-sm text-[var(--accent)]">~€2.63</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">Amazon integration</td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">EU marketplace export</td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">A+ content generation</td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--muted-fg)]">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50">
                  <td className="px-6 py-4 text-sm">Priority support</td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--muted-fg)]">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--muted-fg)]">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-[var(--accent)]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: FAQ */}
        <section className="mt-20">
          <h2 className="text-center font-display text-2xl md:text-3xl">Frequently asked questions</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            <details className="group rounded-xl border border-[var(--border)]">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium">
                How do credits work?
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-[var(--muted-fg)]">
                Each generation — whether it&apos;s a product image or A+ content — costs 1 credit. Credits are consumed when you generate and can be used across all integrations.
              </div>
            </details>

            <details className="group rounded-xl border border-[var(--border)]">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium">
                When will credit purchases be available?
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-[var(--muted-fg)]">
                Credit purchases are coming soon. Enter your email above to be notified when checkout opens.
              </div>
            </details>

            <details className="group rounded-xl border border-[var(--border)]">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium">
                Can I use ProductPixl for free?
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-[var(--muted-fg)]">
                Yes! Every new account starts with 10 free credits. No credit card required. Simply sign up with Google or email to get started.
              </div>
            </details>

            <details className="group rounded-xl border border-[var(--border)]">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium">
                Does it work with Amazon EU marketplaces?
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-[var(--muted-fg)]">
                Yes, ProductPixl supports export to Amazon EU and UK marketplaces. Generate images and copy, then export directly to your listings.
              </div>
            </details>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-20 text-center">
          <p className="text-[var(--muted-fg)]">Questions? Email us at <a href="mailto:hello@productpixl.com" className="text-[var(--accent)] hover:underline">hello@productpixl.com</a></p>
        </section>
      </main>
    </div>
  );
}
