/** Common Amazon category paths for searchable combobox — not exhaustive. */
export const AMAZON_CATEGORY_SUGGESTIONS = [
  "Home & Kitchen > Kitchen & Dining > Cookware",
  "Home & Kitchen > Kitchen & Dining > Small Appliances",
  "Home & Kitchen > Home Décor Products",
  "Beauty & Personal Care > Hair Care",
  "Beauty & Personal Care > Skin Care",
  "Sports & Outdoors > Exercise & Fitness",
  "Electronics > Headphones, Earbuds & Accessories",
  "Electronics > Computer Accessories & Peripherals",
  "Toys & Games > Games & Accessories",
  "Baby Products > Baby Care",
  "Pet Supplies > Dogs",
  "Pet Supplies > Cats",
  "Health & Household > Vitamins, Minerals & Supplements",
  "Clothing, Shoes & Jewelry > Men",
  "Clothing, Shoes & Jewelry > Women",
  "Tools & Home Improvement > Power & Hand Tools",
  "Office Products > Office & School Supplies",
  "Grocery & Gourmet Food > Snack Foods",
  "Automotive > Car Care",
  "Garden & Outdoor > Outdoor Décor",
] as const;

export function filterCategories(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...AMAZON_CATEGORY_SUGGESTIONS].slice(0, limit);
  return AMAZON_CATEGORY_SUGGESTIONS.filter((c) => c.toLowerCase().includes(q)).slice(0, limit);
}
