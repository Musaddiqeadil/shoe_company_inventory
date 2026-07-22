import Link from "next/link";
import { CATEGORIES, categorySlug } from "@/lib/constants";

// The 7 category buttons. `active` highlights the current category.
export default function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive = active === category;
        return (
          <Link
            key={category}
            href={`/category/${categorySlug(category)}`}
            className={
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
              (isActive
                ? "border-gold bg-gold text-ink"
                : "border-cream-dark bg-card text-ink hover:border-gold hover:text-gold-dark")
            }
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
