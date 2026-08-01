import { SIZES, sizeMap } from "@/lib/constants";

// Displays every size with its stock. Out-of-stock (qty 0) sizes are greyed
// and labelled "out"; available sizes show the quantity.
export default function SizeRow({
  sizes,
}: {
  sizes: { size: number; quantity: number }[];
}) {
  const map = sizeMap(sizes);
  return (
    // Twelve sizes now, so the boxes are kept narrow enough to sit six to a
    // row on a phone.
    <div className="flex flex-wrap gap-1.5">
      {SIZES.map((size) => {
        const qty = map.get(size) ?? 0;
        const inStock = qty > 0;
        return (
          <div
            key={size}
            className={
              "flex w-12 flex-col items-center rounded-md border py-1.5 text-center " +
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
