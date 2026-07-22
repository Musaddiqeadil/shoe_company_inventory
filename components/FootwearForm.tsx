import { saveFootwear } from "@/app/admin/actions";
import ImageUpload from "@/components/ImageUpload";
import { CATEGORIES, GENDER_GROUPS, SIZES } from "@/lib/constants";
import { sizeMap } from "@/lib/data";

type ExistingItem = {
  code: string;
  name: string;
  category: string;
  genderGroup: string | null;
  sellingPrice: number;
  imageUrl: string | null;
  description: string | null;
  sizes: { size: number; quantity: number }[];
};

// Shared add/edit form. When `item` is provided the fields are pre-filled and
// the code is locked (you edit the same item rather than creating a new one).
export default function FootwearForm({ item }: { item?: ExistingItem }) {
  const qty = sizeMap(item?.sizes ?? []);
  const label = "block text-sm font-medium text-ink mb-1";
  const field =
    "w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";

  return (
    <form action={saveFootwear} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="code">
            Code *
          </label>
          <input
            id="code"
            name="code"
            required
            defaultValue={item?.code}
            readOnly={!!item}
            placeholder="e.g. SPT-115"
            className={field + (item ? " bg-cream-dark/40" : "")}
          />
        </div>
        <div>
          <label className={label} htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={item?.name}
            placeholder="e.g. Nike Air Runner"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={item?.category ?? ""}
            className={field}
          >
            <option value="" disabled>
              Choose…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="genderGroup">
            Group (optional)
          </label>
          <select
            id="genderGroup"
            name="genderGroup"
            defaultValue={item?.genderGroup ?? ""}
            className={field}
          >
            <option value="">—</option>
            {GENDER_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="sellingPrice">
            Selling price (₹) *
          </label>
          <input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            min={0}
            required
            defaultValue={item?.sellingPrice}
            placeholder="e.g. 2499"
            className={field}
          />
        </div>
        <div>
          <span className={label}>Photo</span>
          <ImageUpload name="imageUrl" defaultUrl={item?.imageUrl ?? ""} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={item?.description ?? ""}
          placeholder="Lightweight running shoe…"
          className={field}
        />
      </div>

      <div>
        <p className={label}>Stock by size (leave 0 if not stocked)</p>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => (
            <label key={size} className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-ink">{size}</span>
              <input
                name={`size_${size}`}
                type="number"
                min={0}
                defaultValue={qty.get(size) ?? 0}
                className="w-16 rounded-md border border-cream-dark bg-card px-2 py-1.5 text-center text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 font-semibold text-ink hover:bg-gold-dark"
        >
          {item ? "Save changes" : "Add footwear"}
        </button>
      </div>
    </form>
  );
}
