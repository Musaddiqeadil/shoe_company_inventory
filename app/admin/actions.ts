"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, SIZES, categorySlug, normalizeCode } from "@/lib/constants";

function toInt(value: FormDataEntryValue | null): number {
  const n = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

// For optional price fields: blank -> null, otherwise the number.
function toIntOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (raw === "") return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

// What the add/edit form shows when a save is refused.
export type SaveState = { error: string } | null;

// Create a new footwear item, or update the one being edited.
//
// The edit form sends `originalCode` — that is what says "update this exact
// item". Without it this is a brand-new shoe, and a code already in use is
// REFUSED rather than written over: an add must never overwrite another shoe.
export async function saveFootwear(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const originalCode = normalizeCode(String(formData.get("originalCode") ?? ""));
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const genderGroup = String(formData.get("genderGroup") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sellingPrice = toInt(formData.get("sellingPrice"));
  const purchasePrice = toIntOrNull(formData.get("purchasePrice"));
  const lastSellingPrice = toIntOrNull(formData.get("lastSellingPrice"));

  if (!code) return { error: "Code is required." };
  if (!name) return { error: "Name is required." };
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Please choose a valid category." };
  }

  // Keep only sizes with a quantity above zero.
  const sizes = SIZES.map((size) => ({
    size,
    quantity: toInt(formData.get(`size_${size}`)),
  })).filter((s) => s.quantity > 0);

  const data = {
    name,
    category,
    genderGroup: genderGroup || null,
    description: description || null,
    imageUrl: imageUrl || null,
    sellingPrice,
    purchasePrice,
    lastSellingPrice,
    sizes,
  };

  if (originalCode) {
    // Editing: update that exact shoe. The code itself is never changed here,
    // so this can't land on a different shoe's document.
    const existing = await prisma.footwear.findUnique({
      where: { code: originalCode },
    });
    if (!existing) {
      return { error: `${originalCode} no longer exists — it may have been deleted.` };
    }
    await prisma.footwear.update({ where: { code: originalCode }, data });
  } else {
    // Adding: a code already in use belongs to another shoe. Stop, and say
    // which one, instead of writing over it.
    const clash = await prisma.footwear.findUnique({ where: { code } });
    if (clash) {
      return {
        error:
          `Code ${code} is already used by "${clash.name}"` +
          (clash.serial != null ? ` (S${clash.serial}, ${clash.category})` : "") +
          `. Give this shoe a different code, or edit that item instead.`,
      };
    }

    // Next sequential number (S1, S2, …) — only assigned to brand-new shoes.
    const highest = await prisma.footwear.findFirst({
      orderBy: { serial: "desc" },
      select: { serial: true },
    });
    const nextSerial = (highest?.serial ?? 0) + 1;

    await prisma.footwear.create({
      data: { code, serial: nextSerial, ...data },
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/item/${encodeURIComponent(code)}`);
  revalidatePath(`/category/${categorySlug(category)}`);
  redirect(`/item/${encodeURIComponent(code)}`);
}

// Delete a footwear item (its embedded sizes go with it).
export async function deleteFootwear(formData: FormData) {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!code) throw new Error("Code is required.");
  await prisma.footwear.delete({ where: { code } });
  revalidatePath("/admin");
  redirect("/admin");
}
