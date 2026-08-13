"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFootwearByAnyId } from "@/lib/data";
import { SIZES, categorySlug, parseSaleDate } from "@/lib/constants";

// What the sell form shows when a sale is refused.
export type SellState = { error: string } | null;

function toInt(value: FormDataEntryValue | null): number {
  const n = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

// Record a sale and take the sold pairs out of stock, then land on the sold
// list so the entry is right there. Called from the sell page you reach with
// the Sold button on a shoe.
//
// The shoe is re-read here (not trusted from the form) so the stock check runs
// against what is actually in the database at this moment.
export async function sellFootwear(
  _prev: SellState,
  formData: FormData
): Promise<SellState> {
  const shoeId = String(formData.get("shoeId") ?? "").trim();
  const size = toInt(formData.get("size"));
  const quantity = toInt(formData.get("quantity"));
  const unitPrice = toInt(formData.get("unitPrice"));
  const soldAt = parseSaleDate(String(formData.get("soldAt") ?? ""));

  if (!shoeId) return { error: "Which shoe is this?" };
  if (!size) return { error: "Choose the size that was sold." };
  if (quantity < 1) return { error: "Pairs sold must be at least 1." };
  if (unitPrice < 0) return { error: "Price cannot be negative." };

  const item = await getFootwearByAnyId(shoeId);
  if (!item) return { error: `No shoe found with ID ${shoeId}.` };

  const inStock = item.sizes.find((s) => s.size === size)?.quantity ?? 0;
  if (inStock < quantity) {
    return {
      error:
        inStock === 0
          ? `Size ${size} is out of stock.`
          : `Only ${inStock} left in size ${size}.`,
    };
  }

  // Take the sold pairs out of that size; a size that hits 0 is dropped from
  // the list, the same way the stock form stores it.
  const sizes = item.sizes
    .map((s) => (s.size === size ? { ...s, quantity: s.quantity - quantity } : s))
    .filter((s) => s.quantity > 0);

  await prisma.footwear.update({
    where: { id: item.id },
    data: { sizes, lastSellingPrice: unitPrice },
  });

  await prisma.sale.create({
    data: {
      footwearId: item.id,
      code: item.code,
      serial: item.serial,
      itemName: item.name,
      imageUrl: item.imageUrl,
      size,
      quantity,
      listPrice: item.sellingPrice,
      unitPrice,
      total: unitPrice * quantity,
      costPrice: item.purchasePrice,
      soldAt,
    },
  });

  revalidatePath("/sales");
  revalidatePath("/sales/monthly");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/item/${encodeURIComponent(item.code)}`);
  revalidatePath(`/category/${categorySlug(item.category)}`);

  // redirect() throws to unwind, so it has to be the last thing here.
  redirect("/sales");
}

// What the edit form sends back. Prices that may legitimately be blank come as
// null; the date is the "2026-08-04" an <input type="date"> produces.
export type SaleEdit = {
  soldAt: string;
  size: number;
  quantity: number;
  listPrice: number | null;
  unitPrice: number;
  costPrice: number | null;
};

export type SaleEditResult =
  | { error: string }
  | { costPrice: number | null; profit: number | null };

// Whole rupees only, and never negative. Blank is allowed for the prices that
// are optional on a sale, which is what null means here.
function badMoney(value: number | null) {
  return value != null && (!Number.isInteger(value) || value < 0);
}

// Correct a sale that has already been recorded — wrong day, wrong size, wrong
// price, wrong purchase price. This is for putting a mistake right, not for
// re-pricing: a sale deliberately keeps its own copy of the prices as they
// stood on the day (see the create above), so editing a shoe today must never
// reach back into last month's profit. A number typed wrong at the till is a
// different matter, and until now there was no way to fix one.
//
// Which shoe was sold cannot be changed here. That is not a correction, it is
// a different sale — delete this one and record it again.
export async function updateSale(
  saleId: string,
  edit: SaleEdit
): Promise<SaleEditResult> {
  if (!saleId.trim()) return { error: "Which sale is this?" };

  const { size, quantity, unitPrice, listPrice, costPrice } = edit;

  if (!SIZES.includes(size as (typeof SIZES)[number])) {
    return { error: "Choose the size that was sold." };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "Pairs sold must be at least 1." };
  }
  if (badMoney(unitPrice)) return { error: "Sold price must be whole rupees." };
  if (badMoney(listPrice)) {
    return { error: "Selling price must be whole rupees." };
  }
  if (badMoney(costPrice)) {
    return { error: "Purchase price must be whole rupees." };
  }

  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return { error: "That sale is no longer there." };

  // Stock has to follow the correction, or the shelf count drifts away from
  // reality. The pairs this sale originally took go back on first, then the
  // corrected pairs come off — so changing "size 9" to "size 8" returns the
  // pair to 9 and takes one from 8, and the same-size case still works out.
  //
  // A shoe that has since been deleted has no stock left to put right, so the
  // sale is simply corrected on its own.
  const item = await prisma.footwear.findUnique({
    where: { id: sale.footwearId },
  });

  if (item && (sale.size !== size || sale.quantity !== quantity)) {
    const stock = new Map(item.sizes.map((s) => [s.size, s.quantity]));
    stock.set(sale.size, (stock.get(sale.size) ?? 0) + sale.quantity);

    const available = stock.get(size) ?? 0;
    if (available < quantity) {
      return {
        error:
          available === 0
            ? `Size ${size} is out of stock.`
            : `Only ${available} left in size ${size}.`,
      };
    }
    stock.set(size, available - quantity);

    await prisma.footwear.update({
      where: { id: item.id },
      data: {
        sizes: [...stock.entries()]
          .filter(([, q]) => q > 0)
          .map(([s, q]) => ({ size: s, quantity: q }))
          .sort((a, b) => a.size - b.size),
      },
    });
  }

  const updated = await prisma.sale.update({
    where: { id: sale.id },
    data: {
      soldAt: parseSaleDate(edit.soldAt),
      size,
      quantity,
      listPrice,
      unitPrice,
      total: unitPrice * quantity,
      costPrice,
    },
  });

  revalidatePath("/sales");
  revalidatePath("/sales/monthly");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/item/${encodeURIComponent(sale.code)}`);
  if (item) revalidatePath(`/category/${categorySlug(item.category)}`);

  return {
    costPrice: updated.costPrice,
    profit:
      updated.costPrice == null
        ? null
        : updated.total - updated.costPrice * updated.quantity,
  };
}
