import { auth } from "@/lib/auth";
import { GenerateWizard } from "@/components/generate/generate-wizard";

export default async function GeneratePage() {
  const session = await auth();
  return <GenerateWizard initialCredits={session?.user?.credits ?? 0} />;
}
