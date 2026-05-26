"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="h-12 w-full rounded-xl border-[var(--border-strong)] bg-[var(--card)] text-base hover:bg-[var(--muted)]/40"
      size="lg"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Redirecting to Google…
        </>
      ) : (
        <>
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </>
      )}
    </Button>
  );
}

export function GoogleSignInForm({
  action,
  errorDescribedBy,
}: {
  action: () => Promise<void>;
  errorDescribedBy?: string;
}) {
  return (
    <form className="mt-8" action={action} aria-describedby={errorDescribedBy}>
      <SubmitButton />
    </form>
  );
}
