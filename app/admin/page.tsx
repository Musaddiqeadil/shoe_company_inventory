import Link from "next/link";
import FootwearImage from "@/components/FootwearImage";
import { getAllFootwear } from "@/lib/data";
import { formatPrice, totalStock } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const items = await getAllFootwear();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage stock</h1>
          <p className="text-ink-soft">{items.length} item(s) in inventory</p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-gold-dark"
        >
          + Add footwear
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
          No footwear yet. Add your first item.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="space-y-3 sm:hidden">
            {items.map((item) => {
              const stock = totalStock(item.sizes);
              return (
                <li key={item.code}>
                  <Link
                    href={`/admin/${encodeURIComponent(item.code)}/edit`}
                    className="flex items-center gap-3 rounded-xl border border-cream-dark bg-card p-3 shadow-sm"
                  >
                    <FootwearImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-gold-dark">
                        {item.code} · {item.category}
                      </p>
                      <p className="text-sm text-ink">
                        {formatPrice(item.sellingPrice)}{" "}
                        <span
                          className={
                            "ml-1 " +
                            (stock > 0 ? "text-ink-soft" : "text-red-600")
                          }
                        >
                          · {stock > 0 ? `${stock} in stock` : "Out of stock"}
                        </span>
                      </p>
                      {item.purchasePrice != null && (
                        <p className="text-xs text-ink-soft">
                          Cost {formatPrice(item.purchasePrice)}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-gold-dark">Edit</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop / tablet: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-cream-dark bg-card shadow-sm sm:block">
            <table className="w-full text-left text-sm">
            <thead className="bg-cream-dark/50 text-ink">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stock = totalStock(item.sizes);
                return (
                  <tr
                    key={item.code}
                    className="border-t border-cream-dark/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FootwearImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-md"
                        />
                        <span className="font-medium text-ink">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gold-dark">{item.code}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {formatPrice(item.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {item.purchasePrice != null
                        ? formatPrice(item.purchasePrice)
                        : "—"}
                    </td>
                    <td
                      className={
                        "px-4 py-3 " +
                        (stock > 0 ? "text-ink-soft" : "text-red-600")
                      }
                    >
                      {stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/${encodeURIComponent(item.code)}/edit`}
                        className="text-gold-dark hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
