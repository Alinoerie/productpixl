"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface AmazonIntegrationProps {
  userId: string;
  userEmail: string;
}

export function AmazonIntegration({ userId, userEmail }: AmazonIntegrationProps) {
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
        body: JSON.stringify({ email, integration: "amazon" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    // Placeholder — actual Amazon SP-API OAuth is a separate project
    alert("Amazon Seller Central OAuth integration is in development. Join the waitlist to be notified when it launches.");
  }

  return (
    <StudioPageShell
      eyebrow="Integrations"
      title="Amazon Seller Central"
      description="One-click listing submission directly to your Seller Central account."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Connection card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Connect your Seller Central account</CardTitle>
                <Badge variant="outline" className="text-xs">Coming soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
                {/* Amazon logo placeholder */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[var(--accent)]">
                    <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.892-1.301 1.439-2.186 1.439-1.124 0-1.858-.784-1.858-1.991 0-1.821 1.394-2.772 3.635-2.772v-.027zm.5 2.243c-.41 0-.727.127-.963.37-.248.255-.373.639-.373 1.137 0 .822.409 1.32 1.062 1.32.602 0 1.003-.447 1.003-1.138 0-.54-.18-.975-.502-1.248-.29-.241-.648-.441-1.227-.441zm.193 2.502h-.51v-.38h.51c.298 0 .498-.076.644-.228.138-.152.204-.369.204-.648 0-.499-.203-.776-.631-.776zM21.006 11.558h-3.001v.8h2.715v.608h-2.715v1.034h3.001v.608h-3.84V9.93h3.84v.608h-.001v.02zM17.385 14.11c-.502 0-.858-.243-.858-.643 0-.399.356-.643.858-.643.49 0 .855.244.855.643 0 .4-.364.643-.855.643zm.002 1.01c.782 0 1.304-.38 1.304-.993v-2.206h-.684v2.845l-.001.001-.001.001-.618.001v.35h1.001v.001h-.001zm-.687-1.676h.001v-.527h.515c.498 0 .752.182.752.59 0 .407-.254.575-.615.575h-.653v-.638zm2.686-3.097h.684v2.845c0 .613.522.993 1.304.993v-.35h-1.001v-.001h.001v-3.487h-.988zm5.77-.608h-.685v1.378h-.685v.608h.685v3.487h.684v-3.487h.685v-.608h-.685v-1.378zm-.685-1.378c0-.498.355-.9.858-.9.49 0 .855.402.855.9a.9.9 0 01-.855.901c-.503 0-.858-.403-.858-.901z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Amazon SP-API</p>
                  <p className="text-sm text-[var(--muted-fg)]">Secure OAuth via Selling Partner API</p>
                </div>
              </div>

              <p className="text-sm text-[var(--muted-fg)]">
                Connect your Amazon Seller Central account to directly upload ProductPixl-generated listings 
                without manual export. Uses Amazon&apos;s official Selling Partner API.
              </p>

              <Button onClick={handleConnect} className="w-full" size="lg">
                {connected ? "Connected to Amazon" : "Connect Amazon Seller Central"}
              </Button>

              <p className="text-xs text-[var(--muted-fg)] text-center">
                Coming soon — Direct upload to Seller Central eliminates manual upload
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
                  "One-click listing submission to Seller Central",
                  "Automatic inventory and price sync",
                  "Bulk upload for entire catalog runs",
                  "Real-time submission status tracking",
                  "Multi-marketplace support (US, DE, UK, FR, IT, ES)",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 text-[var(--accent)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              Join the waitlist to be notified when Amazon Seller Central integration launches.
            </p>
            {submitted ? (
              <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm text-[var(--success)]">
                You&apos;re on the list! We&apos;ll email you when the integration is ready.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="amazon-waitlist-email">Email address</Label>
                  <input
                    id="amazon-waitlist-email"
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
