import { Camera, FileText, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typicalCopyRunCredits, typicalImageRunCredits } from "@/lib/credit-pricing";

const uses = [
  {
    icon: Camera,
    label: "Gallery generation",
    detail: "Per gallery image + research, QA, and studio depth",
    cost: `from ~${typicalImageRunCredits()} credits`,
  },
  {
    icon: FileText,
    label: "Listing copy",
    detail: "Research-backed title, bullets, description, backend keywords",
    cost: `from ~${typicalCopyRunCredits()} credits`,
  },
  {
    icon: Wand2,
    label: "Spot edit or retry",
    detail: "Single-module refinement — scales with module and project detail",
    cost: "Varies per image",
  },
];

export function CreditUsageGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">How credits are used</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {uses.map((item) => (
            <li key={item.label} className="flex gap-3 text-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--accent)]">
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span>
                <span className="font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-fg)]">{item.detail}</span>
              </span>
              <span className="ml-auto shrink-0 text-right text-xs font-semibold text-[var(--accent)]">
                {item.cost}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--muted-fg)]">
          Totals update live in each studio before you run. Listing grader and saved copy edits are free.
        </p>
      </CardContent>
    </Card>
  );
}
