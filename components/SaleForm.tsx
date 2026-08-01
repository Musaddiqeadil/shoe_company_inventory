"use client";

import { useActionState, useState } from "react";
import FootwearImage from "@/components/FootwearImage";
import { recordSale, type SaleState } from "@/app/sales/actions";
import {
  SIZES,
  formatPrice,
  shoeLabel,
  sizeMap,
  todayInputValue,
} from "@/lib/constants";

type LookedUpItem = {
  code: string;
  serial: number | null;
  name: string;
  category: string;
  sellingPrice: number;
  lastSellingPrice: number | null;
  imageUrl: string | null;
  sizes: { size: number; quantity: number }[];
};

// The billing form. Flow: type the shoe ID → the available sizes appear →
// pick one → enter the customer's name and number → Record sale, which takes
// the pairs out of that size's stock.
export default function SaleForm() {
  const [state, formAction, pending] = useActionState<SaleState, FormData>(
    recordSale,
    null
  );

  const [shoeId, setShoeId] = useState("");
  const [item, setItem] = useState<LookedUpItem | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  // Bumped after a successful sale; remounting the form clears the text boxes.
  const [formKey, setFormKey] = useState(0);
  const [handledState, setHandledState] = useState<SaleState>(null);

  // After a successful sale, clear everything so the next customer can be
  // billed straight away. Done during render (not in an effect) so the empty
  // form is what actually paints.
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) {
      setShoeId("");
      setItem(null);
      setSize(null);
      setLookupError("");
      setFormKey((k) => k + 1);
    }
  }

  const label = "block text-sm font-medium text-ink mb-1";
  const field =
    "w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";

  // Fetch the shoe and its per-size stock.
  async function lookup() {
    const id = shoeId.trim();
    if (!id) return;
    setLooking(true);
    setLookupError("");
    setItem(null);
    setSize(null);
    try {
      const res = await fetch(`/api/footwear/lookup?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error ?? "Could not find that shoe.");
        return;
      }
      setItem(data.item);
      // Pre-select the size if only one is in stock.
      const available = data.item.sizes.filter(
        (s: { quantity: number }) => s.quantity > 0
      );
      if (available.length === 1) setSize(available[0].size);
    } catch {
      setLookupError("Lookup failed. Check your connection and try again.");
    } finally {
      setLooking(false);
    }
  }

  const map = sizeMap(item?.sizes ?? []);
  const maxQty = size != null ? map.get(size) ?? 0 : 0;
  const totalStockLeft = (item?.sizes ?? []).reduce((n, s) => n + s.quantity, 0);

  return (
    <form
      key={formKey}
      action={formAction}
      className="space-y-5 rounded-2xl border border-cream-dark bg-card p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-semibold text-ink">New sale</h2>

      {/* Customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="customerName">
            Customer name *
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            placeholder="e.g. Ramesh Kumar"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="customerPhone">
            Number *
          </label>
          <input
            id="customerPhone"
            name="customerPhone"
            required
            type="tel"
            inputMode="tel"
            placeholder="e.g. 9513260298"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="soldAt">
            Date of sale *
          </label>
          <input
            id="soldAt"
            name="soldAt"
            type="date"
            required
            defaultValue={todayInputValue()}
            className={field}
          />
        </div>
      </div>

      {/* Shoe ID */}
      <div>
        <label className={label} htmlFor="shoeId">
          Shoe ID * <span className="font-normal text-ink-soft">(code like SPT-115, or S-number like S12)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="shoeId"
            name="shoeId"
            required
            value={shoeId}
            onChange={(e) => {
              setShoeId(e.target.value);
              setItem(null);
              setSize(null);
              setLookupError("");
            }}
            onKeyDown={(e) => {
              // Enter looks the shoe up instead of submitting a half-filled form.
              if (e.key === "Enter") {
                e.preventDefault();
                lookup();
              }
            }}
            placeholder="Enter shoe ID"
            className={field}
          />
          <button
            type="button"
            onClick={lookup}
            disabled={looking || !shoeId.trim()}
            className="shrink-0 rounded-lg bg-ink px-5 py-2 font-semibold text-cream hover:bg-ink-soft disabled:opacity-50"
          >
            {looking ? "…" : "Find"}
          </button>
        </div>
        {lookupError && (
          <p className="mt-2 text-sm text-red-600">{lookupError}</p>
        )}
      </div>

      {/* The shoe + its available sizes */}
      {item && (
        <div className="space-y-4 rounded-xl border border-gold/50 bg-cream/40 p-4">
          <div className="flex items-center gap-3">
            <FootwearImage
              src={item.imageUrl}
              alt={item.name}
              className="h-16 w-16 shrink-0 rounded-md"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-gold-dark">
                {shoeLabel(item.serial, item.code)} · {item.category}
              </p>
              <p className="text-sm text-ink">
                {formatPrice(item.sellingPrice)}
                <span className="ml-2 text-ink-soft">
                  · {totalStockLeft} in stock
                </span>
              </p>
            </div>
          </div>

          <div>
            <p className={label}>Available sizes — choose one *</p>
            {totalStockLeft === 0 ? (
              <p className="text-sm text-red-600">
                This shoe is completely out of stock.
              </p>
            ) : (
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
                        "flex w-16 flex-col items-center rounded-md border py-1.5 text-center transition-colors " +
                        (selected
                          ? "border-gold bg-gold text-ink"
                          : available
                          ? "border-gold/60 bg-card text-ink hover:border-gold"
                          : "cursor-not-allowed border-cream-dark bg-cream-dark/40 text-ink-soft")
                      }
                    >
                      <span className="text-base font-semibold">{s}</span>
                      <span className="text-xs">
                        {available ? `${qty} left` : "out"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {/* The chosen size travels with the form. */}
            <input type="hidden" name="size" value={size ?? ""} />
          </div>

          {size != null && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="quantity">
                  Pairs sold * <span className="font-normal text-ink-soft">(max {maxQty})</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  max={maxQty}
                  defaultValue={1}
                  required
                  className={field}
                />
              </div>
              <div>
                <label className={label} htmlFor="unitPrice">
                  Price per pair (₹) *
                </label>
                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min={0}
                  required
                  // Keyed so switching shoes refreshes the suggested price.
                  key={item.code}
                  defaultValue={item.sellingPrice}
                  className={field}
                />
                {item.lastSellingPrice != null && (
                  <p className="mt-1 text-xs text-ink-soft">
                    Last sold at {formatPrice(item.lastSellingPrice)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className={label} htmlFor="note">
          Note (optional)
        </label>
        <input
          id="note"
          name="note"
          placeholder="e.g. paid by UPI"
          className={field}
        />
      </div>

      {state && (
        <p
          className={
            "rounded-lg px-4 py-3 text-sm " +
            (state.ok
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700")
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !item || size == null}
        className="rounded-lg bg-gold px-6 py-2.5 font-semibold text-ink hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Recording…" : "Record sale"}
      </button>
    </form>
  );
}
