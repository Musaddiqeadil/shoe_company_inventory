import SellByIdBox from "@/components/SellByIdBox";
import SoldList from "@/components/SoldList";
import { getAllSales } from "@/lib/data";
import { formatPrice, saleDayKey, todayInputValue } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await getAllSales();

  const today = todayInputValue();
  const todaySales = sales.filter((s) => saleDayKey(s.soldAt) === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayPairs = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sold</h1>
          <p className="text-ink-soft">
            Everything sold, newest first. Stock is already adjusted.
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

      <SellByIdBox />

      {/* No link to /sales/monthly on purpose — that page is reached by
          typing the address, so the profit figures aren't advertised here. */}
      {sales.length === 0 ? (
        <p className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
          Nothing sold yet. Open a shoe and press Sold.
        </p>
      ) : (
        // Only what the list shows is handed over — cost and profit stay on
        // the server until someone taps a row seven times.
        <SoldList
          sales={sales.map((s) => ({
            id: s.id,
            code: s.code,
            serial: s.serial,
            itemName: s.itemName,
            imageUrl: s.imageUrl,
            size: s.size,
            quantity: s.quantity,
            listPrice: s.listPrice,
            unitPrice: s.unitPrice,
            total: s.total,
            soldAt: s.soldAt,
            note: s.note,
          }))}
        />
      )}
    </div>
  );
}
