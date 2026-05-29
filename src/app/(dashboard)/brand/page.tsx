import { auth } from "@/lib/auth";
import { BrandKitPage } from "@/components/brand/brand-kit-page";
import { isBrandOnboardingComplete } from "@/lib/brand-profile";
import { getBrandJourney } from "@/lib/user-journey";

export default async function BrandPage() {
  const session = await auth();
  const onboardingComplete = session?.user?.id
    ? await isBrandOnboardingComplete(session.user.id)
    : false;
  const journey = getBrandJourney(onboardingComplete);

  return <BrandKitPage guide={journey} />;
}
