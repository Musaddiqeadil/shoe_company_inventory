"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFootwearByAnyId } from "@/lib/data";
import {
  categorySlug,
  formatPrice,
  parseSaleDate,
  shoeLabel,
} from "@/lib/constants";

// What the sales form gets back after a submit. `ok` drives the green banner
// and resets the form; anything else shows the message in red.
export type SaleState = {
  ok: boolean;
  message: string;
} | null;

function toInt(value: FormDataEntryValue | null): number {
  const n = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

type SaleInput = {
  shoeId: string;
  size: number;
  quantity: number;
  unitPrice: number | null; // null = charge the shoe's current selling price
  customerName: string;
  customerPhone: string;
  note: string;
  soldAt: Date;
};

// Record a sale and take the sold pairs out of stock. Shared by the full
// sales form and the one-tap "Sold" button on a shoe's page.
//
// The shoe is re-read here (not trusted from the form) so the stock check runs
// against what is actually in the database at this moment.
async function applySale(input: SaleInput): Promise<{
  ok: boolean;
  message: string;
}> {
  const { shoeId, size, quantity, customerName, customerPhone, note, soldAt } =
    input;

  if (!shoeId) return { ok: false, message: "Enter the shoe ID." };
  if (!size) return { ok: false, message: "Choose a size." };
  if (quantity < 1) return { ok: false, message: "Quantity must be at least 1." };

  const item = await getFootwearByAnyId(shoeId);
  if (!item) return { ok: false, message: `No shoe found with ID ${shoeId}.` };

  const unitPrice = input.unitPrice ?? item.sellingPrice;
  if (unitPrice < 0) return { ok: false, message: "Price cannot be negative." };

  const inStock = item.sizes.find((s) => s.size === size)?.quantity ?? 0;
  if (inStock < quantity) {
    return {
      ok: false,
      message:
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

  const total = unitPrice * quantity;

  await prisma.footwear.update({
    where: { id: item.id },
    data: { sizes, lastSellingPrice: unitPrice },
  });

  await prisma.sale.create({
    data: {
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      footwearId: item.id,
      code: item.code,
      serial: item.serial,
      itemName: item.name,
      size,
      quantity,
      unitPrice,
      total,
      note: note || null,
      soldAt,
    },
  });

  revalidatePath("/sales");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/item/${item.code}`);
  revalidatePath(`/category/${categorySlug(item.category)}`);

  return {
    ok: true,
    message: `Sold ${quantity} × size ${size} of ${item.name} (${shoeLabel(
      item.serial,
      item.code
    )})${customerName ? ` to ${customerName}` : ""} — ${formatPrice(total)}.`,
  };
}

// The full form on /sales: customer details, size, quantity, price and date.
export async function recordSale(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!customerName) return { ok: false, message: "Customer name is required." };
  if (!customerPhone)
    return { ok: false, message: "Customer number is required." };

  return applySale({
    shoeId: String(formData.get("shoeId") ?? "").trim(),
    size: toInt(formData.get("size")),
    quantity: toInt(formData.get("quantity")),
    unitPrice: toInt(formData.get("unitPrice")),
    customerName,
    customerPhone,
    note: String(formData.get("note") ?? "").trim(),
    soldAt: parseSaleDate(String(formData.get("soldAt") ?? "")),
  });
}

// The "Sold" button on a shoe's own page: tapping a size sells one pair of it
// at the current selling price on the chosen date, then lands on the sales
// list so the shopkeeper sees the entry they just made.
export async function quickSell(formData: FormData) {
  const result = await applySale({
    shoeId: String(formData.get("shoeId") ?? "").trim(),
    size: toInt(formData.get("size")),
    quantity: 1,
    unitPrice: null, // current selling price
    customerName: "",
    customerPhone: "",
    note: "",
    soldAt: parseSaleDate(String(formData.get("soldAt") ?? "")),
  });

  // redirect() throws to unwind, so it has to happen outside any try/catch.
  redirect(result.ok ? "/sales" : `/sales?error=${encodeURIComponent(result.message)}`);
}
