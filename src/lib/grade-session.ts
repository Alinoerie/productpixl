const gradedKey = (productId: string) => `productpixl:graded:${productId}`;

export function markProductGraded(productId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(gradedKey(productId), "1");
}

export function isProductGraded(productId: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(gradedKey(productId)) === "1";
}
