import { getFootwearByAnyId, getFootwearByCode } from "@/lib/data";
import { normalizeCode } from "@/lib/constants";

// Look a shoe up. `?id=` accepts either the code or the S-number — used by the
// sales page, which returns the per-size stock so the form can show what is
// actually available. `?code=` matches the code and nothing else — used by the
// add form to warn that a code is already taken.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const id = code ?? params.get("id") ?? "";

  if (!id.trim()) {
    return Response.json({ error: "Enter a shoe ID." }, { status: 400 });
  }

  const item = code
    ? await getFootwearByCode(code)
    : await getFootwearByAnyId(id);

  if (!item) {
    return Response.json(
      { error: `No shoe found with ID ${normalizeCode(id)}.` },
      { status: 404 }
    );
  }

  return Response.json({
    item: {
      code: item.code,
      serial: item.serial,
      name: item.name,
      category: item.category,
      sellingPrice: item.sellingPrice,
      lastSellingPrice: item.lastSellingPrice,
      imageUrl: item.imageUrl,
      sizes: item.sizes,
    },
  });
}
