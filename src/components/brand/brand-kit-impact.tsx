import { FileText, ImageIcon, ShieldCheck } from "lucide-react";

const impacts = [
  {
    icon: ImageIcon,
    title: "Image studio",
    body: "Primary & accent colors, logo, and visual style guide every hero, lifestyle, and infographic module.",
  },
  {
    icon: FileText,
    title: "Copy studio",
    body: "Tone, shopper audience, language, and your brand story shape titles, bullets, and backend keywords.",
  },
  {
    icon: ShieldCheck,
    title: "Consistency",
    body: "One kit per brand in the sidebar — switch brands for different catalogs without mixing voices.",
  },
];

export function BrandKitImpact() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {impacts.map(({ icon: Icon, title, body }) => (
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
  );
}
