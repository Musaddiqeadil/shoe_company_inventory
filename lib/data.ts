import { prisma } from "@/lib/prisma";
import { SIZES } from "@/lib/constants";

// Normalise a code the same way on save and on lookup so search is
// case-insensitive and whitespace-tolerant. Codes are stored uppercased.
export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

// Look up one footwear item by its code. Sizes are embedded in the document,
// so they come back automatically. Returns null if no item has that code.
export async function getFootwearByCode(code: string) {
  return prisma.footwear.findUnique({
    where: { code: normalizeCode(code) },
  });
}

// All footwear in a category, newest first, for the browse grid.
export async function getFootwearByCategory(category: string) {
  return prisma.footwear.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
  });
}

// All footwear (used by the admin list).
export async function getAllFootwear() {
  return prisma.footwear.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// One page of footwear plus the total count, for the home-page grid.
export async function getFootwearPage(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.footwear.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.footwear.count(),
  ]);
  return { items, total };
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
