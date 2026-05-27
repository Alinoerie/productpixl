import type { ProductIntakeData } from "@/lib/product-intake";
import type { ListingModuleId } from "@/pipelines/modules";

export const BATCH_RATE_LIMIT_MS = 12_000;
export const BATCH_MAX_ROWS = 50;

export type BatchPipelineKind = "image" | "copy" | "both";

export type BatchJobItem = {
  productId: string;
  kind: BatchPipelineKind;
  marketplace: string;
  includePackaging?: boolean;
  selectedModules?: ListingModuleId[];
  intake?: Partial<ProductIntakeData>;
  chargedCredits: number;
};

export type BatchPipelineInput = {
  userId: string;
  batchId: string;
  items: BatchJobItem[];
  totalChargedCredits: number;
};

export type ListingBuilderRow = {
  name: string;
  inputImageUrl: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

export type CloneVariation = {
  name: string;
  marketplace?: string;
  colors?: string;
  materials?: string;
  keyFeatures?: string;
};
