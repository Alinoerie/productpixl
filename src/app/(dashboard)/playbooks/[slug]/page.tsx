import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveBrand } from "@/lib/brands";
import { getPlaybook, playbookContextBlock } from "@/lib/playbooks/catalog";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { NextStepGuide } from "@/components/ui/next-step-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StartPlaybookForm } from "@/components/playbooks/start-playbook-form";
import { Phase2ComingSoonBanner } from "@/components/ui/phase2-coming-soon-banner";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  const [brand, products] = await Promise.all([
    getActiveBrand(session.user.id),
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, name: true, brandId: true, status: true },
    }),
  ]);

  const brandProducts = products.filter((p) => !p.brandId || p.brandId === brand.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={playbook.channel}
        title={playbook.title}
        description={playbook.subtitle}
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/playbooks">All playbooks</Link>
        </Button>
      </PageHeader>

      <Phase2ComingSoonBanner
        title={`${playbook.title} — batch run coming in Phase 2`}
        body={`Prompt direction below shows how this playbook will apply to ${brand.name}. Run Image studio and Copy studio on individual projects until catalog runs ship.`}
        primaryHref={STUDIO_ROUTES.images}
        primaryLabel="Open Image studio"
        secondaryHref={STUDIO_ROUTES.projects}
        secondaryLabel="View projects"
      />

      <NextStepGuide
        step="Preview"
        title="What this playbook will do"
        body={`When live, ${playbook.title} will apply this prompt direction across every SKU you select for ${brand.name}.`}
        actionHref="#run-playbook"
        actionLabel="See catalog preview"
        variant="muted"
      />

      <Card>
        <CardContent className="space-y-3 p-6 text-sm text-[var(--muted-fg)]">
          <p className="font-medium text-[var(--foreground)]">Prompt direction preview</p>
          <pre className="whitespace-pre-wrap rounded-xl bg-[var(--muted)]/40 p-4 text-xs leading-relaxed">
            {playbookContextBlock(playbook, brand.name)}
          </pre>
        </CardContent>
      </Card>

      <div id="run-playbook" className="scroll-mt-24">
        <StartPlaybookForm
          playbookSlug={playbook.slug}
          playbookTitle={playbook.title}
          brandId={brand.id}
          brandName={brand.name}
          products={brandProducts}
        />
      </div>
    </div>
  );
}
