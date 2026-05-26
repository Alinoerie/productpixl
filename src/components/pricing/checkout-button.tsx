"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  packageKey,
  label,
}: {
  packageKey: "starter" | "growth";
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ package: packageKey }),
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error || "Checkout unavailable");
            }
            if (data.url) {
              window.location.href = data.url;
              return;
            }
            throw new Error("Stripe checkout is not configured yet.");
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Checkout failed";
            setError(msg);
            toast(msg, "error");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Redirecting…" : label}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
