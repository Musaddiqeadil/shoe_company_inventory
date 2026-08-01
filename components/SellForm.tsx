"use client";

import { useActionState, useState } from "react";
import { sellFootwear, type SellState } from "@/app/sales/actions";
import { SIZES, formatPrice, sizeMap, todayInputValue } from "@/lib/constants";

// Everything needed to bill one pair: the date (today already filled in), the
// size that went out, and what it actually sold for. Confirm takes it out of
// stock and drops you on the sold list.
export default function SellForm({
  code,
  sellingPrice,
  sizes,
}: {
  code: string;
  sellingPrice: number;
  sizes: { size: number; quantity: number }[];
}) {
  const [state, formAction, pending] = useActionState<SellState, FormData>(
    sellFootwear,
    null
  );
  const [size, setSize] = useState<number | null>(() => {
    // If only one size is left there is nothing to choose.
    const available = sizes.filter((s) => s.quantity > 0);
    return available.length === 1 ? available[0].size : null;
  });

  const label = "block text-sm font-medium text-ink mb-1";
  const field =
    "w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";

  const map = sizeMap(sizes);
  const maxQty = size != null ? map.get(size) ?? 0 : 0;
  const anyInStock = sizes.some((s) => s.quantity > 0);

  if (!anyInStock) {
    return (
      <p className="rounded-2xl border border-cream-dark bg-card p-6 text-center text-red-600">
        This shoe is out of stock in every size — nothing to sell.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-cream-dark bg-card p-5 shadow-sm sm:p-6"
    >
      <input type="hidden" name="shoeId" value={code} />

      <div>
        <label className={label} htmlFor="soldAt">
          Date of sale
        </label>
        <input
          id="soldAt"
          name="soldAt"
          type="date"
          required
          defaultValue={todayInputValue()}
          className={field + " sm:w-56"}
        />
      </div>

      <div>
        <p className={label}>Size sold *</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const qty = map.get(s) ?? 0;
            const available = qty > 0;
            const selected = size === s;
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                className={
                  "flex w-14 flex-col items-center rounded-md border py-2 text-center transition-colors " +
                  (selected
                    ? "border-gold bg-gold text-ink"
                    : available
                    ? "border-gold/60 bg-card text-ink hover:border-gold"
                    : "cursor-not-allowed border-cream-dark bg-cream-dark/40 text-ink-soft")
                }
              >
                <span className="text-lg font-semibold">{s}</span>
                <span className="text-xs">
                  {available ? `${qty} left` : "out"}
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="size" value={size ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="unitPrice">
            Sold price per pair (₹) *
          </label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min={0}
            required
            defaultValue={sellingPrice}
            className={field}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Listed at {formatPrice(sellingPrice)} — change it if you gave a
            discount.
          </p>
        </div>
        <div>
          <label className={label} htmlFor="quantity">
            Pairs{" "}
            {size != null && (
              <span className="font-normal text-ink-soft">(max {maxQty})</span>
            )}
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={maxQty || undefined}
            defaultValue={1}
            required
            className={field}
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || size == null}
        className="w-full rounded-lg bg-gold px-6 py-3 text-lg font-semibold text-ink hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Saving…" : size == null ? "Choose a size" : "Confirm sale"}
      </button>
    </form>
  );
}
