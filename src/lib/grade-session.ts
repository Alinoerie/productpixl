const gradedKey = (productId: string) => `productpixl:graded:${productId}`;

export const GRADE_UPDATED_EVENT = "productpixl:grade-updated";

export function markProductGraded(productId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(gradedKey(productId), "1");
  window.dispatchEvent(new CustomEvent(GRADE_UPDATED_EVENT, { detail: { productId } }));
}

export function isProductGraded(productId: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(gradedKey(productId)) === "1";
}
