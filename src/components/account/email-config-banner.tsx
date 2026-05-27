import { getEmailConfigStatus } from "@/lib/email/resend-config";

export function EmailConfigBanner() {
  const status = getEmailConfigStatus();
  if (status.productionReady) return null;

  return (
    <div
      className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]"
      role="status"
    >
      <p className="font-medium">Email delivery not fully configured</p>
      <p className="mt-1 text-[var(--muted-fg)]">
        {status.warning} Current sender: <code className="text-xs">{status.from}</code>
      </p>
    </div>
  );
}
