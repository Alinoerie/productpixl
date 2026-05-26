import { auth } from "@/lib/auth";
import { CopyWorkspace } from "@/components/copy/copy-workspace";

export default async function CopyPage() {
  const session = await auth();
  return <CopyWorkspace initialCredits={session?.user?.credits ?? 0} />;
}
