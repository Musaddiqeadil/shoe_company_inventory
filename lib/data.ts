import { prisma } from "@/lib/prisma";
import { normalizeCode, parseShoeId } from "@/lib/constants";

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

// Look up one shoe by whatever ID the shopkeeper typed on the sales page —
// either the code ("SPT-115") or the serial number ("S12" / "12").
export async function getFootwearByAnyId(input: string) {
  const id = parseShoeId(input);
  if (id.kind === "serial") {
    return prisma.footwear.findUnique({ where: { serial: id.serial } });
  }
  return prisma.footwear.findUnique({ where: { code: normalizeCode(id.code) } });
}

// Sale history, newest sale date first (ties broken by when it was entered).
export async function getAllSales(limit = 100) {
  return prisma.sale.findMany({
    orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

// Every sale, for the month-by-month totals. No limit — the monthly page has
// to add up the whole history, not just the recent page of it.
export async function getSalesForReport() {
  return prisma.sale.findMany({
    orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
  });
}
