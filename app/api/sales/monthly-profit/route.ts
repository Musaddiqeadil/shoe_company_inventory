import { getSalesForReport } from "@/lib/data";

// Cost and profit per month, plus the all-time figures. Same idea as the
// per-sale route: the numbers never reach the page until the taps unlock them.
export async function GET() {
  const sales = await getSalesForReport();

  const months: Record<string, { cost: number; profit: number }> = {};
  let totalCost = 0;
  let totalProfit = 0;

  for (const s of sales) {
    const key = s.soldAt.toISOString().slice(0, 7);
    const cost = s.costPrice != null ? s.costPrice * s.quantity : 0;
    const profit = s.total - cost;

    months[key] ??= { cost: 0, profit: 0 };
    months[key].cost += cost;
    months[key].profit += profit;
    totalCost += cost;
    totalProfit += profit;
  }

  return Response.json({ months, total: { cost: totalCost, profit: totalProfit } });
}
