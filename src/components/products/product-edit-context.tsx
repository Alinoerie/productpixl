"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";

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
  if (!edit) return null;

  return (
    <UnsavedNavigationGuard
      enabled={edit.listingDirty}
      onSave={async () => {
        await edit.saveListing();
        edit.setListingDirty(false);
      }}
      onDiscard={() => edit.setListingDirty(false)}
      title="Unsaved listing edits"
      description="Save your copy changes before leaving, or discard them to continue."
    />
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
