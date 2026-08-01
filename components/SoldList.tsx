"use client";

import FootwearImage from "@/components/FootwearImage";
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

// Profit is not part of the list. Tapping a sale seven times fetches it and
// shows it on that row for five seconds.
function useSaleProfit(id: string) {
  return useSecretReveal(async () => {
    try {
      const res = await fetch(`/api/sales/profit?id=${encodeURIComponent(id)}`);
      if (!res.ok) return { profit: null as number | null };
      const { profit } = await res.json();
      return { profit: profit as number | null };
    } catch {
      return { profit: null as number | null };
    }
  });
}

function ProfitBadge({ profit }: { profit: number | null }) {
  return (
    <span className="mt-1 inline-block rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-gold">
      {profit != null ? `Profit ${formatPrice(profit)}` : "No cost recorded"}
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
  const { revealed, tap } = useSaleProfit(s.id);
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
        {revealed && <ProfitBadge profit={revealed.profit} />}
      </td>
    </tr>
  );
}

function SoldCard({ sale: s }: { sale: SoldRow }) {
  const { revealed, tap } = useSaleProfit(s.id);

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
          {revealed && <ProfitBadge profit={revealed.profit} />}
        </div>
      </div>
    </li>
  );
}
