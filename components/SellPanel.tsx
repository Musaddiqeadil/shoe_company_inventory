"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { quickSell } from "@/app/sales/actions";
import { SIZES, formatPrice, sizeMap, todayInputValue } from "@/lib/constants";

// The "Sold" button on a shoe's page. Tap Sold → pick the date and tap the
// number (size) that went out → that pair leaves stock and you land on the
// sales list with the entry at the top.
export default function SellPanel({
  code,
  sellingPrice,
  sizes,
}: {
  code: string;
  sellingPrice: number;
  sizes: { size: number; quantity: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayInputValue);

  const map = sizeMap(sizes);
  const anyInStock = sizes.some((s) => s.quantity > 0);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!anyInStock}
        className="rounded-lg bg-ink px-6 py-2.5 font-semibold text-cream hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {anyInStock ? "Sold" : "Out of stock"}
      </button>
    );
  }

  return (
    <form
      action={quickSell}
      className="space-y-4 rounded-xl border border-gold/60 bg-cream/50 p-4"
    >
      <input type="hidden" name="shoeId" value={code} />

      <div>
        <label
          className="block text-sm font-medium text-ink mb-1"
          htmlFor="soldAt"
        >
          Date of sale
        </label>
        <input
          id="soldAt"
          name="soldAt"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 sm:w-48"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-ink">
          Which number was sold?
        </p>
        <p className="mb-2 text-xs text-ink-soft">
          Tap a size — one pair is sold at {formatPrice(sellingPrice)} and taken
          out of stock.
        </p>
        <SizeButtons map={map} />
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-ink-soft hover:text-ink hover:underline"
      >
        Cancel
      </button>
    </form>
  );
}

// Separate component so useFormStatus can see the submit in progress and stop
// a second size being tapped while the first sale is being saved.
function SizeButtons({ map }: { map: Map<number, number> }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const qty = map.get(size) ?? 0;
        const available = qty > 0;
        return (
          <button
            key={size}
            type="submit"
            name="size"
            value={size}
            disabled={!available || pending}
            className={
              "flex w-16 flex-col items-center rounded-md border py-1.5 text-center transition-colors " +
              (available
                ? "border-gold/60 bg-card text-ink hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-50"
                : "cursor-not-allowed border-cream-dark bg-cream-dark/40 text-ink-soft")
            }
          >
            <span className="text-base font-semibold">{size}</span>
            <span className="text-xs">{available ? `${qty} left` : "out"}</span>
          </button>
        );
      })}
    </div>
  );
}
