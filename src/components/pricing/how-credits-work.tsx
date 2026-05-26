import { ImageIcon, FileText, Sparkles } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Pay per run",
    body: "Credits are only used when you generate images or listing copy — not for browsing or editing.",
  },
  {
    icon: ImageIcon,
    title: "Quote before you run",
    body: "The studio shows the exact credit total before you confirm. Image runs vary by modules and marketplace.",
  },
  {
    icon: FileText,
    title: "Top up when you need more",
    body: "Buy Starter (€29) or Catalog (€79) packs when you need more. Monthly plans will add a recurring allowance later.",
  },
];

export function HowCreditsWork() {
  return (
    <section aria-labelledby="how-credits-heading">
      <h2 id="how-credits-heading" className="font-serif text-xl">
        How credits work
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
        One currency for the whole product: credits. Free signup includes 10 credits. Top up with{" "}
        <strong className="font-medium text-[var(--foreground)]">Starter</strong> or{" "}
        <strong className="font-medium text-[var(--foreground)]">Catalog</strong> packs — monthly Growth & Scale plans
        are coming soon.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]"
          >
            <Icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.5} />
            <p className="mt-3 font-medium">{title}</p>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
