import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZapierIntegration } from "@/components/integrations/zapier-integration";
import { siteUrl } from "@/lib/site-url";

export const metadata = {
  title: "Zapier & Make Integration — ProductPixl",
  description: "Connect ProductPixl to Zapier, Make, and other no-code platforms via webhooks.",
};

export default async function ZapierIntegrationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted-fg)]">Please sign in to access Zapier integration.</p>
      </div>
    );
  }

  // Generate or retrieve user's webhook URL
  const webhookUrl = `${siteUrl()}/api/webhooks/user_${session.user.id}`;

  return (
    <ZapierIntegration
      userId={session.user.id}
      webhookUrl={webhookUrl}
      userEmail={session.user.email ?? ""}
    />
  );
}
