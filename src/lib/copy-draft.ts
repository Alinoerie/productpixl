export const COPY_DRAFT_KEY = "productpixl-copy-draft";

export type CopyDraft = {
  title: string;
  bullets: string[];
  description?: string;
  backendKeywords?: string;
  productId?: string;
};

export function saveCopyDraft(draft: CopyDraft) {
  sessionStorage.setItem(COPY_DRAFT_KEY, JSON.stringify(draft));
}

export function loadCopyDraft(): CopyDraft | null {
  const raw = sessionStorage.getItem(COPY_DRAFT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(COPY_DRAFT_KEY);
  try {
    return JSON.parse(raw) as CopyDraft;
  } catch {
    return null;
  }
}
