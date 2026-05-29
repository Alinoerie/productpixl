import { auth } from "@/lib/auth";
import { VideoStudioWorkspace } from "@/components/studio/video-studio-workspace";

export default async function ContentStudioVideoPage() {
  const session = await auth();

  return <VideoStudioWorkspace initialCredits={session?.user?.credits ?? 0} />;
}
