import Link from "next/link";
import FootwearImage from "@/components/FootwearImage";
import { formatPrice, totalStock } from "@/lib/constants";

type CardItem = {
  code: string;
  name: string;
  category: string;
  sellingPrice: number;
  imageUrl: string | null;
  sizes: { size: number; quantity: number }[];
};

// A tappable product card used in category grids.
export default function FootwearCard({ item }: { item: CardItem }) {
  const stock = totalStock(item.sizes);
  return (
    <Link
      href={`/item/${encodeURIComponent(item.code)}`}
      className="group block overflow-hidden rounded-xl border border-cream-dark bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <FootwearImage
        src={item.imageUrl}
        alt={item.name}
        className="h-40 w-full"
      />
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-gold-dark">
          {item.code}
        </p>
        <p className="mt-0.5 line-clamp-1 font-semibold text-ink">
          {item.name}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold text-ink">
            {formatPrice(item.sellingPrice)}
          </span>
          <span
            className={
              "text-xs " + (stock > 0 ? "text-ink-soft" : "text-red-600")
            }
          >
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
