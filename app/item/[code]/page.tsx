import Link from "next/link";
import FootwearImage from "@/components/FootwearImage";
import SizeRow from "@/components/SizeRow";
import { getFootwearByCode, normalizeCode, totalStock } from "@/lib/data";
import { categorySlug, formatPrice } from "@/lib/constants";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const item = await getFootwearByCode(code);

  if (!item) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-cream-dark bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-ink">
          No footwear found with code{" "}
          <span className="text-gold-dark">{normalizeCode(code)}</span>
        </p>
        <p className="mt-2 text-ink-soft">
          Check the code and try again, or browse a category.
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

  const stock = totalStock(item.sizes);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-gold-dark hover:underline">
        ← Back to search
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <FootwearImage
          src={item.imageUrl}
          alt={item.name}
          className="aspect-square w-full rounded-2xl border border-cream-dark bg-card"
        />

        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-dark">
              {item.code}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-ink">{item.name}</h1>
            <div className="mt-1 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/category/${categorySlug(item.category)}`}
                className="rounded-full border border-cream-dark bg-card px-3 py-1 text-ink-soft hover:border-gold"
              >
                {item.category}
              </Link>
              {item.genderGroup && (
                <span className="rounded-full border border-cream-dark bg-card px-3 py-1 text-ink-soft">
                  {item.genderGroup}
                </span>
              )}
            </div>
          </div>

          <p className="text-3xl font-bold text-ink">
            {formatPrice(item.sellingPrice)}
          </p>

          {item.description && (
            <p className="text-ink-soft">{item.description}</p>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">
              Sizes{" "}
              <span className="font-normal text-ink-soft">
                ({stock} in stock)
              </span>
            </p>
            <SizeRow sizes={item.sizes} />
          </div>

          <Link
            href={`/admin/${encodeURIComponent(item.code)}/edit`}
            className="inline-block text-sm text-gold-dark hover:underline"
          >
            Edit this item
          </Link>
        </div>
      </div>
    </div>
  );
}
