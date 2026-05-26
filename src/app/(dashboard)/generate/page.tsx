import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GenerateWizard } from "@/components/generate/generate-wizard";
import { type MarketplaceId } from "@/lib/marketplaces";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  let linkedProduct = null;
  if (params.productId && session?.user?.id) {
    const product = await prisma.product.findFirst({
      where: { id: params.productId, userId: session.user.id },
    });
    if (product) {
      linkedProduct = {
        id: product.id,
        name: product.name,
        inputImageUrl: product.inputImageUrl,
        marketplace: product.marketplace as MarketplaceId,
        dimensions: product.dimensions,
        materials: product.materials,
        colors: product.colors,
        keyFeatures: product.keyFeatures,
        targetBuyer: product.targetBuyer,
        amazonCategory: product.amazonCategory,
      };
    }
  }

  const missingProductId = Boolean(params.productId && session?.user?.id && !linkedProduct);

  return (
    <GenerateWizard
      initialCredits={session?.user?.credits ?? 0}
      linkedProduct={linkedProduct}
      missingProductId={missingProductId}
    />
  );
}
