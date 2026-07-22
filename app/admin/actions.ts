"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/data";
import { CATEGORIES, SIZES, categorySlug } from "@/lib/constants";

function toInt(value: FormDataEntryValue | null): number {
  const n = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

// Create a new footwear item or update an existing one (matched by code).
// Sizes are stored as an embedded list on the document. Called from the add
// and edit forms.
export async function saveFootwear(formData: FormData) {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const genderGroup = String(formData.get("genderGroup") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sellingPrice = toInt(formData.get("sellingPrice"));

  if (!code) throw new Error("Code is required.");
  if (!name) throw new Error("Name is required.");
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    throw new Error("Please choose a valid category.");
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
    sizes,
  };

  await prisma.footwear.upsert({
    where: { code },
    update: data,
    create: { code, ...data },
  });

  revalidatePath("/admin");
  revalidatePath(`/item/${code}`);
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
