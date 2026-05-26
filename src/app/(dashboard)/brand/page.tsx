import { BrandProfileForm } from "@/components/brand/brand-profile-form";

export default function BrandPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
          Brand system
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">Brand profile</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted-fg)]">
          Colors, tone, and guidelines flow into every PHOILA prompt — consistent output across your
          catalog without re-explaining your brand each run.
        </p>
      </div>
      <BrandProfileForm />
    </div>
  );
}
