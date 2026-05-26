const FAQ = [
  {
    q: "Do I need an Amazon ASIN?",
    a: "No. Upload one product photo — ideal for new launches, private label, and Bol.com before the listing exists.",
  },
  {
    q: "How is this different from Pixii?",
    a: "Pixii starts from an ASIN and costs $207+/mo. ProductPixl is photo-first, pay-per-credit, and includes Bol.com + EU marketplaces.",
  },
  {
    q: "What is RUFUS / COSMO?",
    a: "Amazon's semantic search surfaces. We structure bullets and descriptions so AI shopping assistants can recommend your product — not keyword-stuff.",
  },
  {
    q: "What does one credit buy?",
    a: "One full image pipeline (L1 + L3 + L4, optional L8) OR one copy generation run. Spot-editing a single module costs 1 credit.",
  },
  {
    q: "Is Bol.com supported?",
    a: "Yes — select Bol.com in the marketplace picker. Copy uses Dutch-marketplace tone (direct, trustworthy, less hype).",
  },
  {
    q: "What is the free Listing Grader?",
    a: "Paste your title and bullets at /grader for an A–F score and RUFUS tips — no login required. Great lead-in before you generate.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">FAQ</p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">Common questions</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] open:shadow-[var(--shadow-sm)]"
            >
              <summary className="cursor-pointer list-none px-6 py-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[var(--muted-fg)] transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-[var(--border)] px-6 py-4 text-sm leading-relaxed text-[var(--muted-fg)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
