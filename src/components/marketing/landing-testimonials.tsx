import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  location: string;
  avatarUrl: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "ProductPixl cut our listing time from 3 weeks to 20 minutes. The A+ modules alone saved us €2,000 per product.",
    author: "Sarah M.",
    role: "Home & Kitchen Seller",
    location: "Amsterdam",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    quote:
      "We used to spend €800/month on copywriters for our 200-product catalog. Now one person handles it in ProductPixl. The ROI is insane.",
    author: "Marco B.",
    role: "Electronics Brand Owner",
    location: "Milan",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    quote:
      "The AI actually understands Amazon's style guide. Our listings score 40% higher in the grader after rebuilding with ProductPixl.",
    author: "Lena K.",
    role: "Beauty & Cosmetics Seller",
    location: "Berlin",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
  },
];

export function LandingTestimonials() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            What sellers say
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            Trusted by sellers across Europe
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.author}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 shrink-0 fill-[var(--accent)] text-[var(--accent)]"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-[var(--ink)]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatarUrl}
                  alt={t.author}
                  className="h-10 w-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  <p className="text-xs text-[var(--muted-fg)]">
                    {t.role}, {t.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
