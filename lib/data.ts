import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/constants";

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

// All footwear, newest first (home grid + admin list).
export async function getAllFootwear() {
  return prisma.footwear.findMany({
    orderBy: { createdAt: "desc" },
  });
}
