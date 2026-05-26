"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full rounded-xl" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending link…
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Email me a sign-in link
        </>
      )}
    </Button>
  );
}

export function EmailSignInForm({
  action,
  defaultEmail = "",
}: {
  action: (formData: FormData) => Promise<void>;
  defaultEmail?: string;
}) {
  return (
    <form action={action} className="space-y-3">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@company.com"
          className="mt-2"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
