"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  packageKey,
  label,
}: {
  packageKey: "starter" | "growth";
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package: packageKey }),
          });
          const data = await res.json();
          if (data.url) window.location.href = data.url;
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
