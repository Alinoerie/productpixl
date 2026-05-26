const gradedKey = (productId: string) => `productpixl:graded:${productId}`;

export const GRADE_UPDATED_EVENT = "productpixl:grade-updated";

export type GradeSnapshot = {
  grade: string;
  score: number;
};

export function markProductGraded(productId: string, snapshot?: GradeSnapshot) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(gradedKey(productId), snapshot ? JSON.stringify(snapshot) : "1");
  window.dispatchEvent(
    new CustomEvent(GRADE_UPDATED_EVENT, {
      detail: { productId, grade: snapshot?.grade, score: snapshot?.score },
    })
  );
}

export function getProductGrade(productId: string): GradeSnapshot | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(gradedKey(productId));
  if (!raw) return null;
  if (raw === "1") return null;
  try {
    return JSON.parse(raw) as GradeSnapshot;
  } catch {
    return null;
  }
}

export function isProductGraded(productId: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(gradedKey(productId)) != null;
}
