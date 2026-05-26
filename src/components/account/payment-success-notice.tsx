"use client";

import { useEffect } from "react";

export function PaymentSuccessNotice() {
  useEffect(() => {
    window.dispatchEvent(new Event("credits-updated"));
  }, []);

  return null;
}
