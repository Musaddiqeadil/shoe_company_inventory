// The 7 footwear categories used across the shop.
export const CATEGORIES = [
  "Ladies",
  "Gents",
  "Slipper",
  "Chappal",
  "Formal",
  "Casual",
  "Sports",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Optional grouping shown as a small tag.
export const GENDER_GROUPS = ["Ladies", "Gents", "Kids"] as const;

// Shoe sizes stocked in the shop (UK/India whole numbers).
export const SIZES = [6, 7, 8, 9, 10, 11] as const;

// URL-safe slug for a category, e.g. "Slipper" -> "slipper".
export function categorySlug(category: string) {
  return category.toLowerCase();
}

// Turn a slug back into the matching category name, or null if unknown.
export function categoryFromSlug(slug: string): Category | null {
  return (
    CATEGORIES.find((c) => categorySlug(c) === slug.toLowerCase()) ?? null
  );
}

// Format a whole-rupee amount as e.g. "₹2,499".
export function formatPrice(rupees: number) {
  return "₹" + rupees.toLocaleString("en-IN");
}
