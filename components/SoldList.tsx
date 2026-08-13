"use client";

import { useState } from "react";
import FootwearImage from "@/components/FootwearImage";
import { updateSale } from "@/app/sales/actions";
import {
  SIZES,
  formatPrice,
  formatSaleDate,
  saleDayKey,
  shoeLabel,
} from "@/lib/constants";
import { useSecretReveal } from "@/lib/useSecretReveal";

export type SoldRow = {
  id: string;
  code: string;
  serial: number | null;
  itemName: string;
  imageUrl: string | null;
  size: number;
  quantity: number;
  listPrice: number | null;
  unitPrice: number;
  total: number;
  soldAt: Date;
  note: string | null;
};

// What the seventh tap uncovers: the cost the sale was recorded with, and the
// profit that follows from it. Null when no purchase price was ever entered.
type Revealed = {
  costPrice: number | null;
  profit: number | null;
};

const NOTHING: Revealed = { costPrice: null, profit: null };

// Profit is not part of the list. Tapping a sale seven times fetches it and
// shows it on that row for five seconds.
function useSaleProfit(id: string) {
  return useSecretReveal<Revealed>(async () => {
    try {
      const res = await fetch(`/api/sales/profit?id=${encodeURIComponent(id)}`);
      if (!res.ok) return NOTHING;
      const data = await res.json();
      return {
        costPrice: (data.costPrice ?? null) as number | null,
        profit: (data.profit ?? null) as number | null,
      };
    } catch {
      return NOTHING;
    }
  });
}

// The profit badge, and behind it the way into the correction form. Everything
// to do with cost stays behind the seven taps, so the whole form does too.
function ProfitBadge({
  sale,
  revealed,
  hold,
  release,
}: {
  sale: SoldRow;
  revealed: Revealed;
  hold: () => void;
  release: (value?: Revealed) => void;
}) {
  const [editing, setEditing] = useState(false);

  // Every tap in here is meant for the form, not for the row underneath it,
  // which is counting taps and would hide the panel mid-edit.
  const keep = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <>
      <span className="mt-1 inline-flex items-center gap-2 rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-gold">
        {revealed.profit != null
          ? `Profit ${formatPrice(revealed.profit)}`
          : "No cost recorded"}
        <button
          type="button"
          onClick={(e) => {
            keep(e);
            hold();
            setEditing(true);
          }}
          className="font-normal text-cream underline underline-offset-2"
        >
          Edit sale
        </button>
      </span>

      {editing && (
        <EditSaleDialog
          sale={sale}
          costPrice={revealed.costPrice}
          onClose={() => {
            setEditing(false);
            release();
          }}
          onSaved={(value) => {
            setEditing(false);
            release(value);
          }}
        />
      )}
    </>
  );
}

const fieldClass =
  "w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";
const labelClass = "block text-sm font-medium text-ink mb-1";

// Correcting a recorded sale: the day, the size, the pairs, and the three
// prices. Six fields will not fit under a table row on a phone, so it opens
// over the page instead.
//
// Which shoe was sold is deliberately not editable — see updateSale.
function EditSaleDialog({
  sale,
  costPrice,
  onClose,
  onSaved,
}: {
  sale: SoldRow;
  costPrice: number | null;
  onClose: () => void;
  onSaved: (value: Revealed) => void;
}) {
  const money = (n: number | null) => (n != null ? String(n) : "");

  const [soldAt, setSoldAt] = useState(saleDayKey(sale.soldAt));
  const [size, setSize] = useState(String(sale.size));
  const [quantity, setQuantity] = useState(String(sale.quantity));
  const [listPrice, setListPrice] = useState(money(sale.listPrice));
  const [unitPrice, setUnitPrice] = useState(money(sale.unitPrice));
  const [cost, setCost] = useState(money(costPrice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keep = (e: React.SyntheticEvent) => e.stopPropagation();

  // What the sale will come to once saved, so the arithmetic is visible before
  // committing to it rather than after.
  const total = (Number(unitPrice) || 0) * (Number(quantity) || 0);

  async function save() {
    setError(null);
    setSaving(true);
    const blankIsNull = (v: string) => (v.trim() === "" ? null : Number(v));
    const result = await updateSale(sale.id, {
      soldAt,
      size: Number(size),
      quantity: Number(quantity),
      listPrice: blankIsNull(listPrice),
      unitPrice: Number(unitPrice),
      costPrice: blankIsNull(cost),
    });
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    onSaved({ costPrice: result.costPrice, profit: result.profit });
  }

  return (
    <div
      onClick={(e) => {
        keep(e);
        if (!saving) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center"
    >
      <div
        onClick={keep}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-cream-dark bg-card p-5 text-left shadow-lg"
      >
        <h2 className="text-lg font-bold text-ink">Correct this sale</h2>
        <p className="mt-0.5 text-sm text-gold-dark">
          {sale.itemName} · {shoeLabel(sale.serial, sale.code)}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass} htmlFor={`soldAt-${sale.id}`}>
              Date of sale
            </label>
            <input
              id={`soldAt-${sale.id}`}
              type="date"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor={`size-${sale.id}`}>
                Size sold
              </label>
              <select
                id={`size-${sale.id}`}
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={fieldClass}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor={`qty-${sale.id}`}>
                Pairs
              </label>
              <input
                id={`qty-${sale.id}`}
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor={`list-${sale.id}`}>
                Selling price (₹)
              </label>
              <input
                id={`list-${sale.id}`}
                type="number"
                min={0}
                step={1}
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-ink-soft">What it was listed at.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor={`unit-${sale.id}`}>
                Sold price (₹)
              </label>
              <input
                id={`unit-${sale.id}`}
                type="number"
                min={0}
                step={1}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-ink-soft">Per pair, charged.</p>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor={`cost-${sale.id}`}>
              Purchase price (₹)
            </label>
            <input
              id={`cost-${sale.id}`}
              type="number"
              min={0}
              step={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-ink-soft">
              Per pair, what the shop paid. Leave blank if not known.
            </p>
          </div>

          <p className="rounded-lg bg-cream-dark/40 px-3 py-2 text-sm text-ink">
            Total <span className="font-semibold">{formatPrice(total)}</span>
          </p>

          <p className="text-xs text-ink-soft">
            Changing the size or the pairs moves the stock to match.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-gold px-4 py-2.5 font-semibold text-ink hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-cream-dark px-4 py-2.5 font-medium text-ink-soft hover:border-gold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SoldList({ sales }: { sales: SoldRow[] }) {
  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 sm:hidden">
        {sales.map((s) => (
          <SoldCard key={s.id} sale={s} />
        ))}
      </ul>

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-cream-dark bg-card shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark/50 text-ink">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shoe</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Pairs</th>
              <th className="px-4 py-3">Selling price</th>
              <th className="px-4 py-3">Sold price</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <SoldTableRow key={s.id} sale={s} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SoldTableRow({ sale: s }: { sale: SoldRow }) {
  const { revealed, tap, hold, release } = useSaleProfit(s.id);
  const discounted = s.listPrice != null && s.unitPrice < s.listPrice;

  return (
    <tr
      onClick={tap}
      className="cursor-default select-none border-t border-cream-dark/70"
    >
      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
        {formatSaleDate(s.soldAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <FootwearImage
            src={s.imageUrl}
            alt={s.itemName}
            className="h-11 w-11 shrink-0 rounded-md"
          />
          <div className="min-w-0">
            <span className="block font-medium text-ink">{s.itemName}</span>
            <span className="block text-xs text-gold-dark">
              {shoeLabel(s.serial, s.code)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink">{s.size}</td>
      <td className="px-4 py-3 text-ink">{s.quantity}</td>
      <td className="px-4 py-3 text-ink-soft">
        {s.listPrice != null ? formatPrice(s.listPrice) : "—"}
      </td>
      <td className="px-4 py-3 text-ink">
        {formatPrice(s.unitPrice)}
        {discounted && (
          <span className="block text-xs text-red-600">discounted</span>
        )}
      </td>
      <td className="px-4 py-3 font-semibold text-ink">
        {formatPrice(s.total)}
        {revealed && (
          <ProfitBadge
            sale={s}
            revealed={revealed}
            hold={hold}
            release={release}
          />
        )}
      </td>
    </tr>
  );
}

function SoldCard({ sale: s }: { sale: SoldRow }) {
  const { revealed, tap, hold, release } = useSaleProfit(s.id);

  return (
    <li
      onClick={tap}
      className="select-none rounded-xl border border-cream-dark bg-card p-3 shadow-sm"
    >
      <div className="flex gap-3">
        <FootwearImage
          src={s.imageUrl}
          alt={s.itemName}
          className="h-16 w-16 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium text-ink">{s.itemName}</p>
            <p className="shrink-0 font-semibold text-ink">
              {formatPrice(s.total)}
            </p>
          </div>
          <p className="text-xs text-gold-dark">
            {shoeLabel(s.serial, s.code)} · size {s.size} · {s.quantity} pair(s)
          </p>
          <p className="mt-1 text-sm text-ink">
            Sold at {formatPrice(s.unitPrice)}
            {s.listPrice != null && (
              <span className="text-ink-soft">
                {" "}
                · listed {formatPrice(s.listPrice)}
              </span>
            )}
          </p>
          <p className="text-xs text-ink-soft">{formatSaleDate(s.soldAt)}</p>
          {s.note && <p className="text-xs text-ink-soft">{s.note}</p>}
          {revealed && (
            <ProfitBadge
              sale={s}
              revealed={revealed}
              hold={hold}
              release={release}
            />
          )}
        </div>
      </div>
    </li>
  );
}
