import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductLiveStatus } from "@/components/products/product-live-status";
import { AssetSpotEdit } from "@/components/products/asset-spot-edit";
import { getMarketplace } from "@/lib/marketplaces";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: { assets: true, listingCopy: true },
  });

  if (!product) notFound();

  const bullets = (product.listingCopy?.bullets as string[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{product.name}</h1>
          <p className="text-sm text-[var(--muted-fg)]">
            {product.pipelineType} · {product.status} · {getMarketplace(product.marketplace).label}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>

      {product.status === "PROCESSING" && <ProductLiveStatus productId={product.id} />}

      {product.assets.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl">Images</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.assets.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">
                    {a.moduleId} · {a.status}
                    {a.qaScore != null ? ` · QA ${a.qaScore}/10` : ""}
                  </p>
                  {a.imageUrl && (
                    <a href={a.imageUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.imageUrl} alt="" className="mt-2 aspect-square w-full rounded-lg object-cover" />
                    </a>
                  )}
                  {a.errorMessage && (
                    <p className="mt-2 text-xs text-red-600">{a.errorMessage}</p>
                  )}
                  {a.status === "COMPLETE" && a.imageUrl && (
                    <AssetSpotEdit productId={product.id} assetId={a.id} moduleId={a.moduleId} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {product.listingCopy && (
        <section>
          <h2 className="mb-4 font-serif text-xl">Listing copy</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{product.listingCopy.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="list-disc space-y-2 pl-5">
                {bullets.map((b) => (
                  <li key={b.slice(0, 20)}>{b}</li>
                ))}
              </ul>
              <p className="whitespace-pre-wrap text-[var(--muted-fg)]">{product.listingCopy.description}</p>
              <p className="text-xs">
                <strong>Keywords:</strong> {product.listingCopy.backendKeywords}
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
