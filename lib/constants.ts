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

// Normalise a code the same way on save and on lookup so search is
// case-insensitive and whitespace-tolerant. Codes are stored uppercased.
export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

// Total quantity in stock across every size of an item.
export function totalStock(sizes: { quantity: number }[]) {
  return sizes.reduce((sum, s) => sum + s.quantity, 0);
}

// Build a size -> quantity map covering all six sizes (missing = 0), handy for
// rendering a complete size row even when some sizes were never stocked.
export function sizeMap(sizes: { size: number; quantity: number }[]) {
  const map = new Map<number, number>(SIZES.map((s) => [s, 0]));
  for (const s of sizes) map.set(s.size, s.quantity);
  return map;
}

// These pure helpers live here (not in lib/data) so they can be used by
// client components without pulling in the server-only Prisma client.
