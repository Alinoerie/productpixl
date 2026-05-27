"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ShopifyIntegrationProps {
  userId: string;
  userEmail: string;
}

export function ShopifyIntegration({ userId, userEmail }: ShopifyIntegrationProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/integrations/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, integration: "shopify" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    // Placeholder — actual Shopify app integration is a separate project
    alert("Native Shopify app integration is in development. Join the waitlist to be notified when it launches.");
  }

  return (
    <StudioPageShell
      eyebrow="Integrations"
      title="Shopify App"
      description="ProductPixl directly inside your Shopify admin — generate and publish listings without leaving Shopify."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Connection card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Install ProductPixl in your Shopify store</CardTitle>
                <Badge variant="outline" className="text-xs">Coming soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
                {/* Shopify logo placeholder */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#95BF47]/10">
                  <svg viewBox="0 0 24 24" fill="#95BF47" className="h-7 w-7">
                    <path d="M15.34 6.85c-.08-.03-2.08-.86-2.21-.96-.13-.1-.48-.29-.87-.29-.38 0-.76.17-.97.5-.21.33-.24.78-.09 1.16.16.38.47.78.81 1.06.34.28.75.47 1.19.55.45.08.9.08 1.32 0 .41-.08.77-.24 1.07-.48.3-.24.51-.56.62-.95.11-.39.07-.82-.13-1.19-.19-.37-.54-.7-1.02-.92-.2-.09-.47-.18-.79-.27.01-.01-.14-.04-.35-.1-.21-.06-.45-.09-.72-.09-.62 0-1.18.21-1.56.58-.37.36-.54.84-.47 1.33.07.5.38 1.02.87 1.45.49.43 1.19.78 2.01 1.01.82.23 1.68.32 2.48.27.81-.06 1.5-.28 1.97-.64.47-.36.72-.84.7-1.37-.02-.53-.33-.98-.85-1.25-.52-.27-1.25-.37-2.05-.27-.8.1-1.66.38-2.44.81-.78.43-1.43.99-1.83 1.6-.4.61-.53 1.25-.37 1.81.16.56.58 1.03 1.19 1.33.61.29 1.4.41 2.24.31.84-.1 1.7-.39 2.44-.84.74-.45 1.32-1.05 1.64-1.71.32-.66.34-1.34.07-1.91-.27-.57-.8-.99-1.49-1.19-.69-.2-1.53-.18-2.38.06l.07.03c.38.16.72.39.99.68.27.29.47.64.56 1.03.09.39.06.81-.1 1.2-.16.39-.44.74-.82.99-.38.26-.86.43-1.38.48-.52.06-1.1.02-1.65-.11-.55-.13-1.07-.36-1.48-.67-.41-.31-.71-.7-.87-1.13-.16-.43-.15-.89.03-1.31.18-.42.52-.78.97-1.02.45-.24 1.03-.36 1.65-.34.62.02 1.27.19 1.84.47l.26.13c-.02-.07-.04-.14-.06-.2-.06-.24-.16-.48-.29-.7-.13-.22-.3-.42-.49-.59-.2-.17-.42-.3-.66-.4-.24-.09-.5-.14-.76-.14-.26 0-.52.05-.75.14-.23.09-.44.22-.63.39-.18.17-.33.37-.44.6-.11.23-.17.47-.18.73-.01.26.04.52.13.77.09.25.23.48.41.69.18.21.39.38.63.52.24.14.5.24.78.31l.23.06c-.08-.23-.14-.47-.17-.72z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Native Shopify App</p>
                  <p className="text-sm text-[var(--muted-fg)]">Works inside your Shopify admin</p>
                </div>
              </div>

              <p className="text-sm text-[var(--muted-fg)]">
                Install ProductPixl directly in your Shopify store. Generate professional product images and 
                listing copy without leaving your admin panel. Perfect workflow for Shopify merchants.
              </p>

              <Button onClick={handleConnect} className="w-full" size="lg">
                {connected ? "Connected to Shopify" : "Connect Shopify"}
              </Button>

              <p className="text-xs text-[var(--muted-fg)] text-center">
                Coming soon — ProductPixl inside your Shopify admin
              </p>
            </CardContent>
          </Card>

          {/* Features card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What you&apos;ll get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {[
                  "ProductPixl accessible from your Shopify admin sidebar",
                  "Generate images and copy without leaving Shopify",
                  "Publish listings directly to your store",
                  "Sync product data automatically",
                  "Support for Shopify themes and storefront",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 text-[#95BF47] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Waitlist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Get early access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-fg)]">
              Join the waitlist to be notified when the Shopify app launches.
            </p>
            {submitted ? (
              <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm text-[var(--success)]">
                You&apos;re on the list! We&apos;ll email you when the app is ready.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="shopify-waitlist-email">Email address</Label>
                  <input
                    id="shopify-waitlist-email"
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
