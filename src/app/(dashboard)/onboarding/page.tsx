import { auth } from "@/lib/auth";
import { getBrandProfileForUser, isBrandOnboardingComplete } from "@/lib/brand-profile";
import { redirect } from "next/navigation";
import { BrandOnboardingWizard } from "@/components/onboarding/brand-onboarding-wizard";
import { NextStepGuide } from "@/components/ui/next-step-guide";
import { getOnboardingJourney } from "@/lib/user-journey";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  if (await isBrandOnboardingComplete(session.user.id)) {
    redirect("/studio/images");
  }

  const profile = await getBrandProfileForUser(session.user.id);
  const journey = getOnboardingJourney();

  return (
    <div className="space-y-8">
      <NextStepGuide {...journey} />
      <BrandOnboardingWizard initialProfile={profile} />
    </div>
  );
}
