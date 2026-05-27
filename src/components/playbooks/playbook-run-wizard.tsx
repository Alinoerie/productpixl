"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetch-json";
import { useToast } from "@/components/ui/toast-provider";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { Loader2 } from "lucide-react";

export function PlaybookRunWizard({
  playbookSlug,
  playbookTitle,
  brandId,
  brandName,
  products,
}: {
  playbookSlug: string;
  playbookTitle: string;
  brandId: string;
  brandName: string;
  products: { id: string; name: string; status: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set(products.slice(0, 5).map((p) => p.id)));
  const [runName, setRunName] = useState(`${playbookTitle} · ${brandName}`);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runPlaybook = async () => {
    if (selected.size === 0) {
      toast("Select at least one project", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { ok, data } = await fetchJson<{ runId?: string; error?: string }>("/api/playbooks/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbookSlug,
          brandId,
          productIds: [...selected],
          name: runName,
        }),
      });
      if (!ok) throw new Error(data.error || "Playbook run failed");
      toast(`Playbook queued for ${selected.size} project${selected.size === 1 ? "" : "s"}`);
      router.push(`${STUDIO_ROUTES.myPlaybooks}?started=${data.runId}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Playbook run failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Run {playbookTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">
            No projects yet for this brand.{" "}
            <Link href={STUDIO_ROUTES.images} className="text-[var(--accent)] underline-offset-2 hover:underline">
              Create your first project
            </Link>
          </p>
        ) : (
          <>
            <div>
              <Label htmlFor="run-name">Run name</Label>
              <input
                id="run-name"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Select projects ({selected.size})</Label>
              <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] p-3">
                {products.map((product) => (
                  <li key={product.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[var(--muted)]/40">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggle(product.id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span>{product.name}</span>
                      <span className="ml-auto text-xs text-[var(--muted-fg)]">{product.status}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={() => void runPlaybook()} disabled={submitting || selected.size === 0}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Queuing…
                </>
              ) : (
                `Run playbook on ${selected.size} project${selected.size === 1 ? "" : "s"}`
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
