import { PageHeader } from "@/components/ui/page-header";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";

export default function BrandPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand system"
        title="Brand profile"
        description="Colors, tone, and guidelines flow into every PHOILA prompt — consistent output across your catalog without re-explaining your brand each run."
      />
      <BrandProfileForm />
    </div>
  );
}
