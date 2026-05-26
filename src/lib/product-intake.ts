export interface ProductIntakeData {
  name: string;
  brandName: string;
  category: string;
  dimensions?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  referenceImageUrls?: string[];
}

export const EMPTY_PRODUCT_INTAKE: ProductIntakeData = {
  name: "",
  brandName: "",
  category: "",
  dimensions: "",
  materials: "",
  colors: "",
  keyFeatures: "",
  targetBuyer: "",
  competitors: "",
  vibe: "",
  useCase: "",
  differentiators: "",
  referenceImageUrls: [],
};
