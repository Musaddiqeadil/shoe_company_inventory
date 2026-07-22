import { SIZES } from "@/lib/constants";
import { sizeMap } from "@/lib/data";

// Displays sizes 6–11 with their stock. Out-of-stock (qty 0) sizes are greyed
// and labelled "out"; available sizes show the quantity.
export default function SizeRow({
  sizes,
}: {
  sizes: { size: number; quantity: number }[];
}) {
  const map = sizeMap(sizes);
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const qty = map.get(size) ?? 0;
        const inStock = qty > 0;
        return (
          <div
            key={size}
            className={
              "flex w-14 flex-col items-center rounded-md border py-1.5 text-center " +
              (inStock
                ? "border-gold/60 bg-card"
                : "border-cream-dark bg-cream-dark/40 text-ink-soft")
            }
          >
            <span className="text-base font-semibold">{size}</span>
            <span className="text-xs">{inStock ? qty : "out"}</span>
          </div>
        );
      })}
    </div>
  );
}
