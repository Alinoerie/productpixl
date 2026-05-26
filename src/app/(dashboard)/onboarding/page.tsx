import { auth } from "@/lib/auth";
import { getBrandProfileForUser, isBrandOnboardingComplete } from "@/lib/brand-profile";
import { redirect } from "next/navigation";
import { BrandOnboardingWizard } from "@/components/onboarding/brand-onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  if (await isBrandOnboardingComplete(session.user.id)) {
    redirect("/generate");
  }

  const profile = await getBrandProfileForUser(session.user.id);

  return <BrandOnboardingWizard initialProfile={profile} />;
}
