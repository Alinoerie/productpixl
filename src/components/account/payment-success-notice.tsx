"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast-provider";

export function PaymentSuccessNotice() {
  const { toast } = useToast();

  useEffect(() => {
    window.dispatchEvent(new Event("credits-updated"));
    toast("Credits added to your balance");
  }, [toast]);

  return null;
}
