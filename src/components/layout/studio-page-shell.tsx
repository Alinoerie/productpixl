import { PageHeader } from "@/components/ui/page-header";
import { NextStepGuide } from "@/components/ui/next-step-guide";
import type { JourneyStep } from "@/lib/user-journey";
import { cn } from "@/lib/utils";

export function StudioPageShell({
  eyebrow,
  title,
  description,
  guide,
  hideGuide,
  headerActions,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  guide?: JourneyStep;
  hideGuide?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-8", className)}>
      <PageHeader eyebrow={eyebrow} title={title} description={description}>
        {headerActions}
      </PageHeader>
      {guide && !hideGuide ? <NextStepGuide {...guide} /> : null}
      {children}
    </div>
  );
}
