import Link from "next/link";
import { PIPELINE_ERROR, supportMailto } from "@/lib/pipeline-errors";

export function PipelineErrorMessage({
  message,
  showSupport = true,
  supportSubject = "ProductPixl generation issue",
}: {
  message: string;
  showSupport?: boolean;
  supportSubject?: string;
}) {
  const isInfra =
    message === PIPELINE_ERROR.notConfigured ||
    message.includes("background processing isn't connected");

  return (
    <div className="space-y-2">
      <p>{message}</p>
      {isInfra ? <p className="text-[var(--muted-fg)]">{PIPELINE_ERROR.notConfiguredAction}</p> : null}
      {showSupport ? (
        <p>
          <Link
            href={supportMailto(supportSubject)}
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Contact support
          </Link>
        </p>
      ) : null}
    </div>
  );
}
