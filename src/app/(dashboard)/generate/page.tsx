import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GenerateWizard } from "@/components/generate/generate-wizard";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { type MarketplaceId } from "@/lib/marketplaces";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; success?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const brandProfile = session?.user?.id
    ? await getBrandProfileForUser(session.user.id)
    : null;
  const defaultBrandName = brandProfile?.displayName ?? "";

  let linkedProduct = null;
  if (params.productId && session?.user?.id) {
    const product = await prisma.product.findFirst({
      where: { id: params.productId, userId: session.user.id },
    });
    if (product) {
      const analysis = product.analysisJson as { brandName?: string } | null;
      const refs = (product.referenceImageUrls as string[] | null) ?? [];
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
        competitors: product.competitors,
        vibe: product.vibe,
        useCase: product.useCase,
        differentiators: product.differentiators,
        referenceImageUrls: refs,
        amazonCategory: product.amazonCategory,
        brandName: analysis?.brandName ?? defaultBrandName,
      };
    }
  }

  const missingProductId = Boolean(params.productId && session?.user?.id && !linkedProduct);

  return (
    <GenerateWizard
      initialCredits={session?.user?.credits ?? 0}
      linkedProduct={linkedProduct}
      missingProductId={missingProductId}
      defaultBrandName={defaultBrandName}
      paymentSuccess={params.success === "true"}
    />
  );
}
