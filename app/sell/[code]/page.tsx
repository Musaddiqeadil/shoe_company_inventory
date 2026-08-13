import Link from "next/link";
import FootwearImage from "@/components/FootwearImage";
import SellForm from "@/components/SellForm";
import { getFootwearByAnyId } from "@/lib/data";
import {
  decodeCodeParam,
  formatPrice,
  normalizeCode,
  shoeLabel,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

// The Sold button on a shoe leads here. Reachable by code or S-number, so the
// "sell by ID" box on the sold list can point straight at it too.
export default async function SellPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = decodeCodeParam(rawCode);
  const item = await getFootwearByAnyId(code);

  if (!item) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-cream-dark bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-ink">
          No footwear found with ID{" "}
          <span className="text-gold-dark">{normalizeCode(code)}</span>
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-gold-dark"
        >
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={`/item/${encodeURIComponent(item.code)}`}
        className="text-sm text-gold-dark hover:underline"
      >
        ← Back to {item.name}
      </Link>

      <h1 className="text-2xl font-bold text-ink">Record a sale</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-cream-dark bg-card p-4 shadow-sm">
        <FootwearImage
          src={item.imageUrl}
          alt={item.name}
          className="h-20 w-20 shrink-0 rounded-lg"
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">{item.name}</p>
          <p className="text-sm text-gold-dark">
            {shoeLabel(item.serial, item.code)} · {item.category}
          </p>
          <p className="text-sm text-ink">{formatPrice(item.sellingPrice)}</p>
        </div>
      </div>

      <SellForm
        code={item.code}
        sellingPrice={item.sellingPrice}
        sizes={item.sizes}
      />
    </div>
  );
}
