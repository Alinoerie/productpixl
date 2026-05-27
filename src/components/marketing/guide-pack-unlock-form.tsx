"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUIDE_PACK_STORAGE_KEY } from "@/lib/guide-pack-content";

type GuidePackUnlockFormProps = {
  className?: string;
  onUnlocked?: () => void;
};

export function GuidePackUnlockForm({ className = "", onUnlocked }: GuidePackUnlockFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(GUIDE_PACK_STORAGE_KEY) === "1") {
        setAlreadyUnlocked(true);
        onUnlocked?.();
      }
    } catch {
      /* ignore */
    }
  }, [onUnlocked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setMessage("Enter a valid work email.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/leads/guide-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { error?: string; emailSent?: boolean };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      try {
        localStorage.setItem(GUIDE_PACK_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }

      setAlreadyUnlocked(true);
      setStatus("success");
      setMessage(
        data.emailSent
          ? "Check your inbox — we sent a link to this guide pack."
          : "Unlocked — scroll down to browse all 10 playbooks."
      );
      onUnlocked?.();
    } catch {
      setStatus("error");
      setMessage("Network error — try again.");
    }
  }

  if (alreadyUnlocked) {
    return (
      <div
        className={`rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)]/40 px-5 py-4 ${className}`}
      >
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--success)]">
          <Sparkles className="h-4 w-4 shrink-0" />
          Guide pack unlocked
        </p>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">
          {message ?? "All 10 playbooks are below. Want AI-generated listings too?"}{" "}
          <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Start free in ProductPixl →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={`space-y-3 ${className}`}>
      <label htmlFor="guide-pack-email" className="sr-only">
        Work email
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-fg)]" />
          <input
            id="guide-pack-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@yourstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm outline-none ring-[var(--accent)]/30 placeholder:text-[var(--muted-fg)] focus:border-[var(--accent)] focus:ring-2"
          />
        </div>
        <Button type="submit" size="lg" className="rounded-xl sm:shrink-0" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Unlocking…
            </>
          ) : (
            "Unlock free guide"
          )}
        </Button>
      </div>
      {message && status === "error" ? (
        <p role="alert" className="text-sm text-[var(--error)]">
          {message}
        </p>
      ) : null}
      <p className="text-xs text-[var(--muted-fg)]">
        Free download · No credit card · We email a link when delivery is configured for your address
      </p>
    </form>
  );
}
