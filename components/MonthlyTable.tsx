"use client";

import { formatPrice } from "@/lib/constants";
import { useSecretReveal } from "@/lib/useSecretReveal";

export type MonthRow = {
  key: string; // "2026-08"
  label: string; // "August 2026"
  sales: number;
  pairs: number;
  revenue: number;
  missingCost: number;
};

type Profits = {
  months: Record<string, { cost: number; profit: number }>;
  total: { cost: number; profit: number };
};

// Sales and takings are on the page. Cost and profit are not — they arrive
// only when the Total profit card is tapped seven times, and go again after
// five seconds.
export default function MonthlyTable({
  months,
  grand,
}: {
  months: MonthRow[];
  grand: { sales: number; pairs: number; revenue: number; missingCost: number };
}) {
  const { revealed, tap } = useSecretReveal(async () => {
    try {
      const res = await fetch("/api/sales/monthly-profit");
      if (!res.ok) return null;
      return (await res.json()) as Profits;
    } catch {
      return null;
    }
  });

  const hidden = "•••";
  const monthCost = (key: string) =>
    revealed ? formatPrice(revealed.months[key]?.cost ?? 0) : hidden;
  const monthProfit = (key: string) =>
    revealed ? formatPrice(revealed.months[key]?.profit ?? 0) : hidden;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total sold" value={formatPrice(grand.revenue)} />
        <button
          type="button"
          onClick={tap}
          className="select-none rounded-xl border border-gold/60 bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-gold"
        >
          <p className="text-xs uppercase tracking-wide text-gold-dark">
            Total profit
          </p>
          <p
            className={
              "text-xl font-bold " +
              (revealed ? "text-green-700" : "tracking-widest text-ink-soft")
            }
          >
            {revealed ? formatPrice(revealed.total.profit) : hidden}
          </p>
          {revealed && (
            <p className="text-[11px] text-ink-soft">hides in 5 seconds</p>
          )}
        </button>
        <SummaryCard label="Pairs" value={String(grand.pairs)} />
      </div>

      {/* Mobile: one card per month */}
      <ul className="space-y-3 sm:hidden">
        {months.map((m) => (
          <li
            key={m.key}
            className="rounded-xl border border-cream-dark bg-card p-4 shadow-sm"
          >
            <div className="flex items-baseline justify-between">
              <p className="font-semibold text-ink">{m.label}</p>
              <p className="font-bold text-ink">{formatPrice(m.revenue)}</p>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {m.sales} sale(s) · {m.pairs} pair(s)
            </p>
            <p className="mt-1 text-sm">
              <span className="text-ink-soft">Profit </span>
              <span
                className={
                  revealed ? "font-semibold text-green-700" : "text-ink-soft"
                }
              >
                {monthProfit(m.key)}
              </span>
            </p>
            {m.missingCost > 0 && (
              <p className="mt-1 text-xs text-red-600">
                {m.missingCost} sale(s) had no purchase price — profit reads
                higher than it really is.
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-cream-dark bg-card shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark/50 text-ink">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Pairs</th>
              <th className="px-4 py-3">Sold for</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.key} className="border-t border-cream-dark/70">
                <td className="px-4 py-3 font-medium text-ink">
                  {m.label}
                  {m.missingCost > 0 && (
                    <span className="block text-xs text-red-600">
                      {m.missingCost} without purchase price
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink">{m.sales}</td>
                <td className="px-4 py-3 text-ink">{m.pairs}</td>
                <td className="px-4 py-3 text-ink">{formatPrice(m.revenue)}</td>
                <td className="px-4 py-3 text-ink-soft">{monthCost(m.key)}</td>
                <td
                  className={
                    "px-4 py-3 " +
                    (revealed ? "font-semibold text-green-700" : "text-ink-soft")
                  }
                >
                  {monthProfit(m.key)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-cream-dark bg-cream-dark/30">
              <td className="px-4 py-3 font-semibold text-ink">All time</td>
              <td className="px-4 py-3 font-semibold text-ink">{grand.sales}</td>
              <td className="px-4 py-3 font-semibold text-ink">{grand.pairs}</td>
              <td className="px-4 py-3 font-semibold text-ink">
                {formatPrice(grand.revenue)}
              </td>
              <td className="px-4 py-3 font-semibold text-ink-soft">
                {revealed ? formatPrice(revealed.total.cost) : hidden}
              </td>
              <td
                className={
                  "px-4 py-3 " +
                  (revealed ? "font-bold text-green-700" : "text-ink-soft")
                }
              >
                {revealed ? formatPrice(revealed.total.profit) : hidden}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cream-dark bg-card px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gold-dark">{label}</p>
      <p className="text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
