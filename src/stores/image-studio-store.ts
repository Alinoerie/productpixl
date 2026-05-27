import { create } from "zustand";
import type { ProductIntakeData } from "@/lib/product-intake";
import { EMPTY_PRODUCT_INTAKE } from "@/lib/product-intake";

type ImageStudioState = {
  previewUrl: string;
  productName: string;
  intake: ProductIntakeData;
  creditTotal: number;
  step: number;
  setPreviewUrl: (url: string) => void;
  setProductName: (name: string) => void;
  setIntake: (intake: ProductIntakeData) => void;
  setCreditTotal: (total: number) => void;
  setStep: (step: number) => void;
  reset: () => void;
};

export const useImageStudioStore = create<ImageStudioState>((set) => ({
  previewUrl: "",
  productName: "",
  intake: EMPTY_PRODUCT_INTAKE,
  creditTotal: 0,
  step: 0,
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setProductName: (productName) => set({ productName }),
  setIntake: (intake) => set({ intake }),
  setCreditTotal: (creditTotal) => set({ creditTotal }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({
      previewUrl: "",
      productName: "",
      intake: EMPTY_PRODUCT_INTAKE,
      creditTotal: 0,
      step: 0,
    }),
}));
