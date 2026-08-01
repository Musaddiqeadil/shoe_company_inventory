import Link from "next/link";
import MonthlyTable, { type MonthRow } from "@/components/MonthlyTable";
import { getSalesForReport } from "@/lib/data";

export const dynamic = "force-dynamic";

// Sale days are stored as midday UTC, so the month is simply the first seven
// characters of the ISO date — no timezone arithmetic needed.
function monthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function MonthlySalesPage() {
  const sales = await getSalesForReport();

  // Newest month first — getSalesForReport already sorts by sale date. Note
  // what is NOT counted here: cost and profit never leave the server on this
  // page (see /api/sales/monthly-profit).
  const byMonth = new Map<string, MonthRow>();
  for (const s of sales) {
    const key = s.soldAt.toISOString().slice(0, 7);
    const m =
      byMonth.get(key) ??
      {
        key,
        label: monthLabel(s.soldAt),
        sales: 0,
        pairs: 0,
        revenue: 0,
        missingCost: 0,
      };
    m.sales += 1;
    m.pairs += s.quantity;
    m.revenue += s.total;
    if (s.costPrice == null) m.missingCost += 1;
    byMonth.set(key, m);
  }

  const months = [...byMonth.values()];
  const grand = months.reduce(
    (t, m) => ({
      sales: t.sales + m.sales,
      pairs: t.pairs + m.pairs,
      revenue: t.revenue + m.revenue,
      missingCost: t.missingCost + m.missingCost,
    }),
    { sales: 0, pairs: 0, revenue: 0, missingCost: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/sales" className="text-sm text-gold-dark hover:underline">
          ← Back to sold list
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">Monthly totals</h1>
        <p className="text-ink-soft">What was sold each month.</p>
      </div>

      {months.length === 0 ? (
        <p className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
          Nothing sold yet.
        </p>
      ) : (
        <MonthlyTable months={months} grand={grand} />
      )}
    </div>
  );
}
