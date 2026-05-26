"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketplaceGuidance } from "@/components/ui/marketplace-guidance";
import { MarketplacePicker } from "@/components/ui/marketplace-picker";
import { ReferenceImageUpload } from "@/components/product/reference-image-upload";
import type { ProductIntakeData } from "@/lib/product-intake";
import { type MarketplaceId } from "@/lib/marketplaces";
import { getMarketplace } from "@/lib/marketplaces";

export function ProductIntakeFields({
  form,
  onChange,
  marketplace,
  onMarketplaceChange,
  referenceImageUrls,
  onReferenceImagesChange,
  variant = "images",
  disabled,
}: {
  form: ProductIntakeData;
  onChange: (next: ProductIntakeData) => void;
  marketplace: MarketplaceId;
  onMarketplaceChange: (id: MarketplaceId) => void;
  referenceImageUrls: string[];
  onReferenceImagesChange: (urls: string[]) => void;
  variant?: "images" | "copy";
  disabled?: boolean;
}) {
  const categoryLabel = `${getMarketplace(marketplace).label} category`;
  const setField = <K extends keyof ProductIntakeData>(key: K, value: ProductIntakeData[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <>
      <div className="md:col-span-2">
        <Label className="mb-2 block">Marketplace</Label>
        <MarketplacePicker
          value={marketplace}
          onChange={onMarketplaceChange}
          noteField={variant === "copy" ? "copyNote" : "imageNote"}
          name={`${variant}-marketplace`}
        />
        <div className="mt-3">
          <MarketplaceGuidance marketplaceId={marketplace} variant={variant === "copy" ? "copy" : "images"} />
        </div>
      </div>

      {(
        [
          ["name", "Product name"],
          ["brandName", "Brand name"],
          ["category", categoryLabel],
          ["dimensions", "Dimensions / size"],
          ["materials", "Materials"],
          ["colors", "Colors"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <Label htmlFor={`intake-${key}`}>{label}</Label>
          <Input
            id={`intake-${key}`}
            value={form[key]}
            onChange={(e) => setField(key, e.target.value)}
            disabled={disabled}
          />
        </div>
      ))}

      <div className="md:col-span-2">
        <Label htmlFor="intake-vibe">Product vibe</Label>
        <Input
          id="intake-vibe"
          value={form.vibe ?? ""}
          onChange={(e) => setField("vibe", e.target.value)}
          placeholder="clean spa, rugged outdoor, minimalist luxury…"
          disabled={disabled}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="intake-use-case">Primary use case</Label>
        <Input
          id="intake-use-case"
          value={form.useCase ?? ""}
          onChange={(e) => setField("useCase", e.target.value)}
          placeholder="Daily kitchen hand washing, gym recovery, nursery bedtime…"
          disabled={disabled}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="intake-features">Key features & observations</Label>
        <Textarea
          id="intake-features"
          value={form.keyFeatures ?? ""}
          onChange={(e) => setField("keyFeatures", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="intake-differentiators">What makes this product different?</Label>
        <Textarea
          id="intake-differentiators"
          value={form.differentiators ?? ""}
          onChange={(e) => setField("differentiators", e.target.value)}
          placeholder="Materials, design cues, claims competitors miss…"
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="intake-buyer">Target buyer</Label>
        <Input
          id="intake-buyer"
          value={form.targetBuyer ?? ""}
          onChange={(e) => setField("targetBuyer", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="intake-competitors">Competitors to differentiate from</Label>
        <Input
          id="intake-competitors"
          value={form.competitors ?? ""}
          onChange={(e) => setField("competitors", e.target.value)}
          placeholder="Generic Amazon alternatives, category leaders…"
          disabled={disabled}
        />
      </div>

      {variant === "images" ? (
        <div className="md:col-span-2">
          <ReferenceImageUpload
            urls={referenceImageUrls}
            onChange={onReferenceImagesChange}
            disabled={disabled}
          />
        </div>
      ) : null}
    </>
  );
}
