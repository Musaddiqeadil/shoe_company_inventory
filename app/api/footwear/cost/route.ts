import { getFootwearByCode } from "@/lib/data";

// The purchase price is deliberately NOT rendered into the shoe's page, so it
// can't be found by reading the page source. It is fetched only once someone
// performs the tap gesture (see components/CostReveal.tsx).
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  if (!code.trim()) {
    return Response.json({ error: "Missing code." }, { status: 400 });
  }

  const item = await getFootwearByCode(code);
  if (!item) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  return Response.json({ purchasePrice: item.purchasePrice });
}
