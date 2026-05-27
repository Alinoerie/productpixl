"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketplaceGuidance } from "@/components/ui/marketplace-guidance";
import { MarketplacePicker } from "@/components/ui/marketplace-picker";
import { ReferenceImageUpload } from "@/components/product/reference-image-upload";
import { FloatingLabelField } from "@/components/product/floating-label-field";
import { CategoryCombobox } from "@/components/product/category-combobox";
import type { ProductIntakeData } from "@/lib/product-intake";
import { type MarketplaceId } from "@/lib/marketplaces";
import { getMarketplace } from "@/lib/marketplaces";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductIntakeFields({
  form,
  onChange,
  marketplace,
  onMarketplaceChange,
  referenceImageUrls,
  onReferenceImagesChange,
  variant = "images",
  disabled,
  multiMarketplace = false,
  marketplaces,
  onMarketplacesChange,
}: {
  form: ProductIntakeData;
  onChange: (next: ProductIntakeData) => void;
  marketplace: MarketplaceId;
  onMarketplaceChange: (id: MarketplaceId) => void;
  referenceImageUrls: string[];
  onReferenceImagesChange: (urls: string[]) => void;
  variant?: "images" | "copy";
  disabled?: boolean;
  multiMarketplace?: boolean;
  marketplaces?: MarketplaceId[];
  onMarketplacesChange?: (ids: MarketplaceId[]) => void;
}) {
  const [optionalOpen, setOptionalOpen] = useState(false);
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
          multi={multiMarketplace}
          values={marketplaces ?? [marketplace]}
          onMultiChange={onMarketplacesChange}
        />
        <div className="mt-3">
          <MarketplaceGuidance marketplaceId={marketplace} variant={variant === "copy" ? "copy" : "images"} />
        </div>
      </div>

      <p className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
        Required for generation
      </p>

      <FloatingLabelField
        id="intake-name"
        label="Product name"
        value={form.name}
        onChange={(v) => setField("name", v)}
        disabled={disabled}
      />
      <FloatingLabelField
        id="intake-brandName"
        label="Brand name"
        value={form.brandName}
        onChange={(v) => setField("brandName", v)}
        disabled={disabled}
      />
      <div className="md:col-span-2">
        <CategoryCombobox
          id="intake-category"
          label={categoryLabel}
          value={form.category}
          onChange={(v) => setField("category", v)}
          disabled={disabled}
        />
      </div>

      <div className="md:col-span-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal-soft)]/30 px-3 py-2 text-xs text-[var(--muted-fg)]">
        Your product&apos;s shape, label, and colors are preserved in every generated image — only backgrounds and scenes change.
      </div>

      <div className="md:col-span-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setOptionalOpen((v) => !v)}
          aria-expanded={optionalOpen}
        >
          <div>
            <p className="text-sm font-medium">Improve results (optional)</p>
            <p className="text-xs text-[var(--muted-fg)]">
              More detail helps prompts — skip if you are in a hurry.
            </p>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", optionalOpen && "rotate-180")} />
        </button>

        {optionalOpen ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FloatingLabelField
              id="intake-dimensions"
              label="Dimensions / size"
              value={form.dimensions ?? ""}
              onChange={(v) => setField("dimensions", v)}
              disabled={disabled}
            />
            <FloatingLabelField
              id="intake-materials"
              label="Materials"
              value={form.materials ?? ""}
              onChange={(v) => setField("materials", v)}
              disabled={disabled}
            />
            <FloatingLabelField
              id="intake-colors"
              label="Colors"
              value={form.colors ?? ""}
              onChange={(v) => setField("colors", v)}
              disabled={disabled}
            />

            <div className="md:col-span-2">
              <FloatingLabelField
                id="intake-vibe"
                label="Product vibe"
                value={form.vibe ?? ""}
                onChange={(v) => setField("vibe", v)}
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-2">
              <FloatingLabelField
                id="intake-use-case"
                label="Primary use case"
                value={form.useCase ?? ""}
                onChange={(v) => setField("useCase", v)}
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

            <FloatingLabelField
              id="intake-buyer"
              label="Target buyer"
              value={form.targetBuyer ?? ""}
              onChange={(v) => setField("targetBuyer", v)}
              disabled={disabled}
            />

            <FloatingLabelField
              id="intake-competitors"
              label="Competitors to differentiate from"
              value={form.competitors ?? ""}
              onChange={(v) => setField("competitors", v)}
              disabled={disabled}
            />

            {variant === "images" ? (
              <div className="md:col-span-2">
                <ReferenceImageUpload
                  urls={referenceImageUrls}
                  onChange={onReferenceImagesChange}
                  disabled={disabled}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
