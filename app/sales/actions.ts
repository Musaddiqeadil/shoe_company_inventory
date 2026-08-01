"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFootwearByAnyId } from "@/lib/data";
import { categorySlug, parseSaleDate } from "@/lib/constants";

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
  revalidatePath(`/item/${item.code}`);
  revalidatePath(`/category/${categorySlug(item.category)}`);

  // redirect() throws to unwind, so it has to be the last thing here.
  redirect("/sales");
}
