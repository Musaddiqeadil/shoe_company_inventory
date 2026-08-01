import Link from "next/link";
import SaleForm from "@/components/SaleForm";
import { getAllSales } from "@/lib/data";
import {
  formatPrice,
  formatSaleDate,
  saleDayKey,
  shoeLabel,
  todayInputValue,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // A failed one-tap sale from a shoe's page lands here with its reason.
  const { error } = await searchParams;
  const sales = await getAllSales();

  const today = todayInputValue();
  const todaySales = sales.filter((s) => saleDayKey(s.soldAt) === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayPairs = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sales</h1>
          <p className="text-ink-soft">
            Record a sale — the stock of that size goes down automatically.
          </p>
        </div>
        <div className="rounded-xl border border-cream-dark bg-card px-4 py-2 text-right shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gold-dark">Today</p>
          <p className="text-lg font-bold text-ink">{formatPrice(todayTotal)}</p>
          <p className="text-xs text-ink-soft">
            {todaySales.length} sale(s) · {todayPairs} pair(s)
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <SaleForm />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Recent sales</h2>

        {sales.length === 0 ? (
          <p className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
            No sales recorded yet.
          </p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <ul className="space-y-3 sm:hidden">
              {sales.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-cream-dark bg-card p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {s.customerName || "Counter sale"}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {s.customerPhone || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-ink">
                        {formatPrice(s.total)}
                      </p>
                      <p className="text-xs text-gold-dark">
                        {formatSaleDate(s.soldAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink">{s.itemName}</p>
                  <p className="text-xs text-gold-dark">
                    {shoeLabel(s.serial, s.code)} · size {s.size} ·{" "}
                    {s.quantity} pair(s)
                  </p>
                  {s.note && (
                    <p className="mt-1 text-xs text-ink-soft">{s.note}</p>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop / tablet: table */}
            <div className="hidden overflow-hidden rounded-2xl border border-cream-dark bg-card shadow-sm sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-dark/50 text-ink">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Number</th>
                    <th className="px-4 py-3">Shoe</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-t border-cream-dark/70">
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                        {formatSaleDate(s.soldAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {s.customerName || (
                          <span className="font-normal text-ink-soft">
                            Counter sale
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {s.customerPhone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/item/${encodeURIComponent(s.code)}`}
                          className="text-ink hover:text-gold-dark"
                        >
                          {s.itemName}
                          <span className="block text-xs text-gold-dark">
                            {shoeLabel(s.serial, s.code)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink">{s.size}</td>
                      <td className="px-4 py-3 text-ink">{s.quantity}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {formatPrice(s.unitPrice)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {formatPrice(s.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
