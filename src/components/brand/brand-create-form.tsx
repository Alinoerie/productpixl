"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function BrandCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/brands/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setDescription("");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create brand");
      }
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        className="h-auto w-full flex-col gap-1 border-dashed py-6 text-[var(--muted-fg)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        onClick={() => setOpen(true)}
      >
        <span className="text-2xl">+</span>
        <span className="text-sm font-medium">Create new brand</span>
      </Button>
    );
  }

  return (
    <Card className="border-[var(--accent)]">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-sm text-[var(--error)]">{error}</p>
          )}
          <div>
            <Label htmlFor="new-brand-name" className="text-xs">
              Brand name
            </Label>
            <Input
              id="new-brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Studio Iris"
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="new-brand-description" className="text-xs">
              Short description{" "}
              <span className="text-[var(--muted-fg)]">(optional)</span>
            </Label>
            <Input
              id="new-brand-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Premium skincare for EU marketplaces"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Creating…" : "Create brand"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
