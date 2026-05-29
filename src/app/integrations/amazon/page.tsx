import { auth } from "@/lib/auth";
import { AmazonIntegration } from "@/components/integrations/amazon-integration";

export const metadata = {
  title: "Amazon Integration — ProductPixl",
  description: "Connect your Amazon Seller Central account to ProductPixl for one-click listing submission.",
};

export default async function AmazonIntegrationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted-fg)]">Please sign in to access Amazon integration.</p>
      </div>
    );
  }

  return <AmazonIntegration userId={session.user.id} userEmail={session.user.email ?? ""} />;
}
