import { prisma } from "@/lib/prisma";

// Profit on one sale. Kept out of the sold list's HTML on purpose — only
// fetched when someone taps that row seven times.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id.trim()) {
    return Response.json({ error: "Missing id." }, { status: 400 });
  }

  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) return Response.json({ error: "Not found." }, { status: 404 });

  if (sale.costPrice == null) {
    return Response.json({ costPrice: null, cost: null, profit: null });
  }

  // costPrice is per pair — that is what gets edited when a wrong purchase
  // price was recorded — while cost is what the whole sale cost.
  const cost = sale.costPrice * sale.quantity;
  return Response.json({
    costPrice: sale.costPrice,
    cost,
    profit: sale.total - cost,
  });
}
