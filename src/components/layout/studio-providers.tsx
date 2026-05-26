"use client";

import { ToastProvider } from "@/components/ui/toast-provider";

export function StudioProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
