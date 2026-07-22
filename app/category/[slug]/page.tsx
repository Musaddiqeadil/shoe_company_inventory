import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryChips from "@/components/CategoryChips";
import FootwearCard from "@/components/FootwearCard";
import { getFootwearByCategory } from "@/lib/data";
import { categoryFromSlug } from "@/lib/constants";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const items = await getFootwearByCategory(category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{category}</h1>
        <p className="text-ink-soft">{items.length} item(s)</p>
      </div>

      <CategoryChips active={category} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
          <p>No footwear in this category yet.</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-gold-dark"
          >
            Add footwear
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <FootwearCard key={item.code} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
