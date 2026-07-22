import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import CategoryChips from "@/components/CategoryChips";
import FootwearCard from "@/components/FootwearCard";
import Pagination from "@/components/Pagination";
import { getFootwearPage } from "@/lib/data";

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { items, total } = await getFootwearPage(page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-cream-dark bg-card p-6 sm:p-10 shadow-sm">
        <h1 className="wordmark text-2xl sm:text-3xl text-ink">
          Find any footwear
        </h1>
        <p className="mt-2 text-ink-soft">
          Type the code from the box or label to see its photo, price and
          available sizes.
        </p>
        <div className="mt-6">
          <SearchBox />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Browse by category
        </h2>
        <CategoryChips />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">All footwear</h2>
          <span className="text-sm text-ink-soft">{total} item(s)</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
            <p>No footwear added yet.</p>
            <Link
              href="/admin/new"
              className="mt-4 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-gold-dark"
            >
              Add your first shoe
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <FootwearCard key={item.code} item={item} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} basePath="/" />
          </>
        )}
      </section>
    </div>
  );
}
