"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveCopyDraft, type CopyDraft } from "@/lib/copy-draft";

export function GradeListingButton({
  listingCopy,
  variant = "outline",
  size = "sm" as const,
  className,
  children = "Grade listing",
}: {
  listingCopy: CopyDraft;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        saveCopyDraft(listingCopy);
        router.push("/grader");
      }}
    >
      {children}
    </Button>
  );
}
