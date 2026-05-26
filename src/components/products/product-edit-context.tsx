"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductEditContextValue = {
  listingDirty: boolean;
  setListingDirty: (dirty: boolean) => void;
  listingSaving: boolean;
  setListingSaving: (saving: boolean) => void;
  registerListingSave: (save: () => Promise<void>) => void;
  saveListing: () => Promise<void>;
};

const ProductEditContext = createContext<ProductEditContextValue | null>(null);

function ProductNavigationGuard() {
  const edit = useProductEdit();
  const router = useRouter();
  const allowNavigationRef = useRef(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!edit?.listingDirty) return;

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
  }, [edit?.listingDirty]);

  const navigateAway = (href: string) => {
    allowNavigationRef.current = true;
    setPendingHref(null);
    if (href.startsWith("/")) {
      router.push(href);
    } else {
      window.location.href = href;
    }
  };

  const stay = () => setPendingHref(null);

  const saveAndLeave = async () => {
    if (!pendingHref || !edit) return;
    setSaving(true);
    try {
      await edit.saveListing();
      edit.setListingDirty(false);
      navigateAway(pendingHref);
    } finally {
      setSaving(false);
    }
  };

  const discardAndLeave = () => {
    if (!pendingHref) return;
    edit?.setListingDirty(false);
    navigateAway(pendingHref);
  };

  if (!pendingHref) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="unsaved-listing-title"
      aria-describedby="unsaved-listing-desc"
      className="fixed inset-x-4 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-lg)] md:bottom-8"
    >
      <p id="unsaved-listing-title" className="font-semibold">
        Unsaved listing edits
      </p>
      <p id="unsaved-listing-desc" className="mt-1 text-sm text-[var(--muted-fg)]">
        Save your copy changes before leaving, or discard them to continue.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={stay}>
          Stay on page
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={discardAndLeave}>
          Discard
        </Button>
        <Button type="button" size="sm" disabled={saving} onClick={saveAndLeave}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save & leave"
          )}
        </Button>
      </div>
    </div>
  );
}

export function ProductEditProvider({ children }: { children: ReactNode }) {
  const saveRef = useRef<(() => Promise<void>) | null>(null);
  const [listingDirty, setListingDirty] = useState(false);
  const [listingSaving, setListingSaving] = useState(false);

  const registerListingSave = useCallback((save: () => Promise<void>) => {
    saveRef.current = save;
  }, []);

  const saveListing = useCallback(async () => {
    if (!saveRef.current) return;
    await saveRef.current();
  }, []);

  return (
    <ProductEditContext.Provider
      value={{
        listingDirty,
        setListingDirty,
        listingSaving,
        setListingSaving,
        registerListingSave,
        saveListing,
      }}
    >
      {children}
      <ProductNavigationGuard />
    </ProductEditContext.Provider>
  );
}

export function useProductEdit() {
  return useContext(ProductEditContext);
}
