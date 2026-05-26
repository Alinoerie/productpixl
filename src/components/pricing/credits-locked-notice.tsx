import { CreditsPaywallBanner } from "@/components/ui/credits-paywall-banner";

export function CreditsLockedNotice() {
  return (
    <div className="space-y-2">
      <CreditsPaywallBanner />
      <p className="text-xs text-[var(--muted-fg)]">
        Your projects, brand profile, and listing edits are still saved to your account. Only new AI generation
        runs require credits.
      </p>
    </div>
  );
}
