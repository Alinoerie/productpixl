"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NotifyMeFormProps {
  placeholder?: string;
  buttonText?: string;
  variant?: "primary" | "outline";
  className?: string;
}

export function NotifyMeForm({
  placeholder = "Enter your email",
  buttonText = "Notify me when checkout opens",
  variant = "primary",
  className = "",
}: NotifyMeFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    try {
      const res = await fetch("/api/integrations/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, integration: "productpixl-pricing" }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("success");
        setMessage("You're on the list!");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Try again.");
    }
  };

  if (state === "success") {
    return (
      <div className={`flex items-center gap-2 text-sm text-[var(--accent)] ${className}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-fg)] focus:border-[var(--accent)]/50 focus:outline-none"
      />
      {variant === "primary" ? (
        <Button type="submit" disabled={state === "loading"} className="btn-primary amber-glow rounded-xl whitespace-nowrap">
          {state === "loading" ? "..." : buttonText}
        </Button>
      ) : (
        <Button type="submit" variant="outline" disabled={state === "loading"} className="btn-outline rounded-xl whitespace-nowrap">
          {state === "loading" ? "..." : buttonText}
        </Button>
      )}
      {state === "error" && <p className="text-xs text-red-400">{message}</p>}
    </form>
  );
}
