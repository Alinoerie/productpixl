"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetch-json";
import { MARKETPLACES, type MarketplaceId } from "@/lib/marketplaces";

export function CopyWorkspace() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copy, setCopy] = useState<{
    title?: string;
    bullets?: string[];
    description?: string;
    backendKeywords?: string;
    status?: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    brandName: "",
    category: "",
    materials: "",
    keyFeatures: "",
    targetBuyer: "",
  });

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
      method: "POST",
      body: fd,
    });
    if (!ok) throw new Error(data.error || "Upload failed");
    setImageUrl(data.url ?? "");
    const { ok: aOk, data: aData } = await fetchJson<{ analysis?: Record<string, string> }>(
      "/api/analyze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.url }),
      }
    );
    if (aOk && aData.analysis) {
      const a = aData.analysis;
      setForm({
        name: a.productName || "",
        brandName: a.brandName || "",
        category: a.amazonCategory || "",
        materials: a.materials || "",
        keyFeatures: a.keyObservations || "",
        targetBuyer: "",
      });
    }
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputImageUrl: imageUrl, marketplace, productData: form }),
      });
      const data = await res.json();
      if (res.status === 402) throw new Error("Insufficient credits");
      if (!res.ok) throw new Error(data.error);
      setProductId(data.productId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    const poll = async () => {
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (res.ok && data.listingCopy) {
        setCopy(data.listingCopy);
        if (data.listingCopy.status === "COMPLETE" || data.listingCopy.status === "FAILED") {
          setLoading(false);
        }
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [productId]);

  const exportJson = () => {
    if (!copy) return;
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "listing-copy.json";
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
          Copy pipeline
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">Listing copy</h1>
        <p className="mt-2 text-[var(--muted-fg)]">
          Title, 5 bullets, description, backend keywords — RUFUS-ready ·{" "}
          <strong className="text-[var(--foreground)]">1 credit</strong>
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {!copy?.title && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Product image (optional but improves accuracy)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </div>
            <div>
              <Label>Marketplace</Label>
              <select
                className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value as MarketplaceId)}
              >
                {MARKETPLACES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {(["name", "brandName", "category", "materials", "targetBuyer"] as const).map((key) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Key features</Label>
              <Textarea
                value={form.keyFeatures}
                onChange={(e) => setForm((f) => ({ ...f, keyFeatures: e.target.value }))}
              />
            </div>
            <Button onClick={generate} disabled={loading || !form.name} className="md:col-span-2">
              {loading ? "Generating…" : "Generate copy (1 credit)"}
            </Button>
          </CardContent>
        </Card>
      )}

      {copy?.title && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={copy.title} onChange={(e) => setCopy({ ...copy, title: e.target.value })} />
            </CardContent>
          </Card>
          {(copy.bullets as string[] | undefined)?.map((b, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={b}
                  onChange={(e) => {
                    const bullets = [...((copy.bullets as string[]) || [])];
                    bullets[i] = e.target.value;
                    setCopy({ ...copy, bullets });
                  }}
                />
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[160px]"
                value={copy.description ?? ""}
                onChange={(e) => setCopy({ ...copy, description: e.target.value })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backend keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={copy.backendKeywords ?? ""}
                onChange={(e) => setCopy({ ...copy, backendKeywords: e.target.value })}
              />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportJson}>
              Download JSON
            </Button>
            {productId && (
              <Button variant="outline" onClick={() => router.push(`/products/${productId}`)}>
                Open project
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
