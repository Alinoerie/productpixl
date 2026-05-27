"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectBanner({ destination = "/studio" }: { destination?: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(destination);
    }, 100);
    return () => clearTimeout(timer);
  }, [destination, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 text-sm text-[var(--foreground)] shadow-sm">
        <span className="text-base font-medium">Redirecting to studio...</span>
        <span className="text-[var(--muted-foreground)]">You will be redirected shortly.</span>
      </div>
    </div>
  );
}
