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

// Shoe sizes stocked in the shop (UK/India whole numbers). Starts at 1 for
// kids' footwear and runs to 12.
export const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

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

// A shoe can be looked up by its code ("SPT-115") or by its serial number,
// typed as "S12" or just "12". Returns which one was typed.
export function parseShoeId(input: string):
  | { kind: "serial"; serial: number }
  | { kind: "code"; code: string } {
  const raw = normalizeCode(input);
  const serialMatch = /^S?(\d+)$/.exec(raw);
  if (serialMatch) return { kind: "serial", serial: Number(serialMatch[1]) };
  return { kind: "code", code: raw };
}

// Short label for a shoe in lists and receipts, e.g. "S12 · SPT-115".
export function shoeLabel(serial: number | null, code: string) {
  return serial != null ? `S${serial} · ${code}` : code;
}

// ── Sale dates ──────────────────────────────────────────────────────────────
// A sale is recorded against a DAY, not a moment, so the shopkeeper can enter
// yesterday's sales this morning. The chosen day is stored as midday UTC: far
// enough from both midnight edges that it still reads as the same date no
// matter where the server is running.

// The shop's clock. Pinned so a page rendered on a server in another timezone
// still agrees with the phone in the shop about what day it is.
export const SHOP_TIMEZONE = "Asia/Kolkata";

// Today in the shop, in the "2026-08-01" format an <input type="date"> wants.
export function todayInputValue() {
  // en-CA formats as YYYY-MM-DD.
  return new Date().toLocaleDateString("en-CA", { timeZone: SHOP_TIMEZONE });
}

// "2026-08-01" (from the date input) -> a Date at midday UTC on that day.
// Anything unparseable falls back to today.
export function parseSaleDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return new Date();
  return new Date(
    Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)
  );
}

// The stored sale day as "2026-08-01", used to group sales by date.
export function saleDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

// The stored sale day for people to read, e.g. "1 Aug 2026".
export function formatSaleDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// These pure helpers live here (not in lib/data) so they can be used by
// client components without pulling in the server-only Prisma client.
