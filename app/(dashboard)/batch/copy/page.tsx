import { auth } from "@/lib/auth";
import { CopyBuilderWorkspace } from "@/components/batch/copy-builder-workspace";

export default async function BatchCopyPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <CopyBuilderWorkspace />;
}
