"use client";

import { useState } from "react";
import FootwearImage from "@/components/FootwearImage";
import { updateSaleCost } from "@/app/sales/actions";
import { formatPrice, formatSaleDate, shoeLabel } from "@/lib/constants";
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

// The profit badge, and behind it the way to put a wrong purchase price right.
// A sale keeps the cost as it stood on the day it was made, so correcting the
// shoe's price later leaves old sales reading the old number — which is what
// you want for a real price change and not at all what you want for a typo.
function ProfitBadge({
  saleId,
  revealed,
  hold,
  release,
}: {
  saleId: string;
  revealed: Revealed;
  hold: () => void;
  release: (value?: Revealed) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every tap in here is meant for the form, not for the row underneath it,
  // which is counting taps and would hide the panel mid-edit.
  const keep = (e: React.SyntheticEvent) => e.stopPropagation();

  function startEditing(e: React.MouseEvent) {
    keep(e);
    hold();
    setValue(revealed.costPrice != null ? String(revealed.costPrice) : "");
    setError(null);
    setEditing(true);
  }

  function cancel(e: React.MouseEvent) {
    keep(e);
    setEditing(false);
    release();
  }

  async function save(e: React.MouseEvent) {
    keep(e);
    const costPrice = Number(value.trim());
    if (!Number.isInteger(costPrice) || costPrice < 0) {
      setError("Whole rupees, 0 or more.");
      return;
    }

    setSaving(true);
    const result = await updateSaleCost(saleId, costPrice);
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setEditing(false);
    release({ costPrice: result.costPrice, profit: result.profit });
  }

  if (editing) {
    return (
      <div
        onClick={keep}
        className="mt-1 inline-block rounded-md border border-gold bg-card p-2 text-left shadow-sm"
      >
        <label className="block text-[11px] font-medium text-ink-soft">
          Purchase price per pair (₹)
        </label>
        <div className="mt-1 flex items-center gap-1">
          <input
            type="number"
            min={0}
            step={1}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 rounded border border-cream-dark bg-card px-2 py-1 text-sm text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-ink px-2 py-1 text-xs font-semibold text-gold disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="rounded px-2 py-1 text-xs text-ink-soft hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        <p className="mt-1 text-[11px] text-ink-soft">
          Corrects this sale only.
        </p>
      </div>
    );
  }

  return (
    <span className="mt-1 inline-flex items-center gap-2 rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-gold">
      {revealed.profit != null
        ? `Profit ${formatPrice(revealed.profit)}`
        : "No cost recorded"}
      <button
        type="button"
        onClick={startEditing}
        className="font-normal text-cream underline underline-offset-2"
      >
        {revealed.costPrice != null ? "Edit cost" : "Add cost"}
      </button>
    </span>
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
            saleId={s.id}
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
              saleId={s.id}
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
