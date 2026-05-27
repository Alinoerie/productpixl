"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ZapierIntegrationProps {
  userId: string;
  webhookUrl: string;
  userEmail: string;
}

const WEBHOOK_PAYLOAD_EXAMPLE = {
  productId: "prod_abc123",
  action: "listing.generated",
  timestamp: "2026-05-27T14:30:00Z",
  data: {
    productName: "Organic Cotton T-Shirt",
    marketplace: "AMAZON_US",
    copy: {
      title: "Premium Organic Cotton Crew Neck T-Shirt for Men",
      bullets: [
        "100% organic cotton, sustainably sourced",
        "Classic fit with reinforced seams for durability",
        "Machine washable for easy care",
      ],
      description: "A comfortable and eco-friendly everyday essential...",
    },
  },
};

export function ZapierIntegration({ userId, webhookUrl, userEmail }: ZapierIntegrationProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/integrations/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, integration: "zapier" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  async function copyWebhookUrl() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <StudioPageShell
      eyebrow="Integrations"
      title="Zapier & Make"
      description="Automate your workflow with webhooks — trigger ProductPixl from Zapier, Make (Integromat), and other no-code platforms."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Webhook URL card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Your Webhook URL</CardTitle>
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-fg)]">
                Use this unique webhook URL to trigger ProductPixl actions from Zapier, Make, or any 
                service that supports webhooks. Copy it and paste it into your Zapier webhook step.
              </p>

              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-sm font-mono">
                  {webhookUrl}
                </code>
                <Button variant="outline" size="sm" onClick={() => void copyWebhookUrl()}>
                  {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="rounded-xl border border-[var(--warning-border)]/30 bg-[var(--warning-bg)]/30 p-3 text-xs text-[var(--muted-fg)]">
                <strong>Security note:</strong> This URL is personal to your account. Keep it private — anyone with 
                this URL can trigger actions on your behalf. Rotate it from Account settings if compromised.
              </div>
            </CardContent>
          </Card>

          {/* Payload documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Payload Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-fg)]">
                When a ProductPixl action completes (e.g., listing generated, images created), your webhook 
                receives a POST request with this JSON payload:
              </p>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Example payload</Label>
                  <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--ink)] p-4 text-xs text-white">
                    {JSON.stringify(WEBHOOK_PAYLOAD_EXAMPLE, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Fields</Label>
                  <dl className="space-y-2 text-sm">
                    {[
                      { field: "productId", type: "string", desc: "Unique product identifier in ProductPixl" },
                      { field: "action", type: "string", desc: "Event type: listing.generated, images.created, copy.completed, etc." },
                      { field: "timestamp", type: "string (ISO 8601)", desc: "When the action completed" },
                      { field: "data", type: "object", desc: "Action-specific data (varies by event type)" },
                    ].map(({ field, type, desc }) => (
                      <div key={field} className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 p-3">
                        <code className="min-w-[120px] font-mono text-xs font-semibold text-[var(--accent)]">{field}</code>
                        <span className="text-xs font-mono text-[var(--muted-fg)]">{type}</span>
                        <span className="text-xs text-[var(--muted-fg)]">— {desc}</span>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zapier/Make info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Zapier & Make Integration</CardTitle>
                <Badge variant="outline" className="text-xs">Coming soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-fg)]">
                Full Zapier and Make (Integromat) integration is coming soon. You&apos;ll be able to connect 
                ProductPixl to 5,000+ apps without writing any code. Join the waitlist to be notified.
              </p>

              <div className="flex flex-wrap gap-4">
                {/* Zapier logo */}
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 px-3 py-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path d="M10.797 15.556c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871zm-4.096-3.018c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871zm8.192 0c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871zm-4.096 6.036c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871zm-4.096-3.018c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871zm8.192 0c-.483 0-.871-.388-.871-.871 0-.483.388-.871.871-.871.483 0 .871.388.871.871 0 .483-.388.871-.871.871z" fill="#FF4A00"/>
                  </svg>
                  <span className="text-sm font-medium">Zapier</span>
                </div>
                {/* Make logo */}
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 px-3 py-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#6D00C9"/>
                    <path d="M8 12a4 4 0 118 0 4 4 0 01-8 0z" fill="white"/>
                  </svg>
                  <span className="text-sm font-medium">Make</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Waitlist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Get notified</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-fg)]">
              Join the waitlist to be notified when Zapier and Make integrations launch.
            </p>
            {submitted ? (
              <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm text-[var(--success)]">
                You&apos;re on the list! We&apos;ll email you when the integration is ready.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="zapier-waitlist-email">Email address</Label>
                  <input
                    id="zapier-waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={userEmail || "you@example.com"}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Join waitlist
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </StudioPageShell>
  );
}
