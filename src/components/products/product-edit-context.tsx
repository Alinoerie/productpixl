"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ProductEditContextValue = {
  listingDirty: boolean;
  setListingDirty: (dirty: boolean) => void;
  listingSaving: boolean;
  setListingSaving: (saving: boolean) => void;
  registerListingSave: (save: () => Promise<void>) => void;
  saveListing: () => Promise<void>;
};

const ProductEditContext = createContext<ProductEditContextValue | null>(null);

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
    </ProductEditContext.Provider>
  );
}

export function useProductEdit() {
  return useContext(ProductEditContext);
}
