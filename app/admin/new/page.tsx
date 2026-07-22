import Link from "next/link";
import FootwearForm from "@/components/FootwearForm";

export default function NewFootwearPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin" className="text-sm text-gold-dark hover:underline">
        ← Back to stock
      </Link>
      <h1 className="text-2xl font-bold text-ink">Add footwear</h1>
      <FootwearForm />
    </div>
  );
}
