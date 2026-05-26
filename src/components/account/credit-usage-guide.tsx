import { Camera, FileText, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const uses = [
  {
    icon: Camera,
    label: "Image pipeline",
    detail: "L1 hero + L3 lifestyle + L4 detail (optional L8 packaging)",
    cost: "1 credit",
  },
  {
    icon: FileText,
    label: "Listing copy",
    detail: "Title, bullets, description, backend keywords",
    cost: "1 credit",
  },
  {
    icon: Wand2,
    label: "Spot edit or retry",
    detail: "Refine one gallery module or retry a failed asset",
    cost: "1 credit",
  },
];

export function CreditUsageGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">What 1 credit buys</CardTitle>
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
              <span className="ml-auto shrink-0 text-xs font-semibold text-[var(--accent)]">{item.cost}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--muted-fg)]">
          Listing grader is free. Editing saved copy on a project costs nothing.
        </p>
      </CardContent>
    </Card>
  );
}
