import { Badge } from "@/components/ui/badge";

const GALLERY = [
  {
    module: "L1",
    label: "Hero",
    before: "Phone snapshot · cluttered desk",
    after: "White-background hero · 1:1 · label legible",
    accent: "from-[var(--muted)] to-white",
  },
  {
    module: "L3",
    label: "Lifestyle",
    before: "No context shot",
    after: "In-use scene · category-appropriate setting",
    accent: "from-[var(--teal-soft)] to-[var(--muted)]",
  },
  {
    module: "L4",
    label: "Detail",
    before: "Blurry texture",
    after: "Macro detail · materials & finish",
    accent: "from-[var(--accent-soft)] to-[var(--muted)]",
  },
  {
    module: "Copy",
    label: "Listing copy",
    before: "Keyword-stuffed bullets",
    after: "RUFUS-ready · benefit-led · A9-safe",
    accent: "from-[var(--ink)]/5 to-[var(--teal-soft)]",
  },
];

export function LandingGallery() {
  return (
    <section id="gallery" className="border-y border-[var(--border)] bg-[var(--card)] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
            Before → after
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            What one photo becomes in the studio
          </h2>
          <p className="mt-4 text-[var(--muted-fg)]">
            Representative outputs from the PHOILA pipeline — hero, lifestyle, detail, and copy tuned
            for conversion, not generic “AI art”.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {GALLERY.map((item) => (
            <div
              key={item.module}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]"
            >
              <div className="grid grid-cols-2">
                <div className={`flex aspect-square flex-col justify-end bg-gradient-to-br ${item.accent} p-4`}>
                  <Badge variant="outline" className="w-fit bg-white/80 text-xs">
                    Before
                  </Badge>
                  <p className="mt-2 text-xs text-[var(--muted-fg)]">{item.before}</p>
                </div>
                <div className="flex aspect-square flex-col justify-end border-l border-[var(--border)] bg-[var(--accent-soft)]/40 p-4">
                  <Badge className="w-fit bg-[var(--accent)] text-xs text-white">
                    After · {item.module}
                  </Badge>
                  <p className="mt-2 text-xs font-medium">{item.after}</p>
                </div>
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <p className="font-semibold">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
