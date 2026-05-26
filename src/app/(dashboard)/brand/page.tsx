import { auth } from "@/lib/auth";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { isBrandOnboardingComplete } from "@/lib/brand-profile";
import { getBrandJourney } from "@/lib/user-journey";

export default async function BrandPage() {
  const session = await auth();
  const onboardingComplete = session?.user?.id
    ? await isBrandOnboardingComplete(session.user.id)
    : false;
  const journey = getBrandJourney(onboardingComplete);

  return (
    <StudioPageShell
      eyebrow="Brand"
      title="Listing brand kit"
      description="Set colors, voice, and rules once per brand. Every image and copy run pulls from the active brand in your sidebar."
      guide={journey}
      className="max-w-6xl"
    >
      <BrandProfileForm />
    </StudioPageShell>
  );
}
