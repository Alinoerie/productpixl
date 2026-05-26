"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnsavedNavigationGuard({
  enabled,
  onSave,
  onDiscard,
  title = "Unsaved changes",
  description = "Save your work before leaving, or discard changes to continue.",
  className,
}: {
  enabled: boolean;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
  title?: string;
  description?: string;
  className?: string;
}): ReactNode {
  const router = useRouter();
  const allowNavigationRef = useRef(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (allowNavigationRef.current) return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor) return;
      if (anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled]);

  const navigateAway = useCallback(
    (href: string) => {
      allowNavigationRef.current = true;
      setPendingHref(null);
      if (href.startsWith("/")) {
        router.push(href);
      } else {
        window.location.href = href;
      }
    },
    [router]
  );

  const stay = () => setPendingHref(null);

  const saveAndLeave = async () => {
    if (!pendingHref || !onSave) return;
    setSaving(true);
    try {
      await onSave();
      navigateAway(pendingHref);
    } finally {
      setSaving(false);
    }
  };

  const discardAndLeave = () => {
    if (!pendingHref) return;
    onDiscard?.();
    navigateAway(pendingHref);
  };

  if (!pendingHref) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="unsaved-nav-title"
      aria-describedby="unsaved-nav-desc"
      className={
        className ??
        "fixed inset-x-4 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-lg)] md:bottom-8"
      }
    >
      <p id="unsaved-nav-title" className="font-semibold">
        {title}
      </p>
      <p id="unsaved-nav-desc" className="mt-1 text-sm text-[var(--muted-fg)]">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={stay}>
          Stay on page
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={discardAndLeave}>
          Discard
        </Button>
        {onSave ? (
          <Button type="button" size="sm" disabled={saving} onClick={saveAndLeave}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save & leave"
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
