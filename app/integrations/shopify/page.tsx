import { auth } from "@/lib/auth";
import { ShopifyIntegration } from "@/components/integrations/shopify-integration";

export const metadata = {
  title: "Shopify Integration — ProductPixl",
  description: "Install the ProductPixl native app in your Shopify store for seamless listing generation.",
};

export default async function ShopifyIntegrationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted-fg)]">Please sign in to access Shopify integration.</p>
      </div>
    );
  }

  return <ShopifyIntegration userId={session.user.id} userEmail={session.user.email ?? ""} />;
}
