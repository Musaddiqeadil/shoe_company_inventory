import Link from "next/link";
import { notFound } from "next/navigation";
import FootwearForm from "@/components/FootwearForm";
import { deleteFootwear } from "@/app/admin/actions";
import { getFootwearByCode } from "@/lib/data";

export default async function EditFootwearPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const item = await getFootwearByCode(code);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin" className="text-sm text-gold-dark hover:underline">
        ← Back to stock
      </Link>
      <h1 className="text-2xl font-bold text-ink">Edit {item.code}</h1>

      <FootwearForm item={item} />

      <form
        action={deleteFootwear}
        className="border-t border-cream-dark pt-5"
      >
        <input type="hidden" name="code" value={item.code} />
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Delete this item
        </button>
      </form>
    </div>
  );
}
