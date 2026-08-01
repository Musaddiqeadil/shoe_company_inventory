"use client";

import FootwearImage from "@/components/FootwearImage";
import { formatPrice } from "@/lib/constants";
import { useSecretReveal } from "@/lib/useSecretReveal";

// Tapping the photo seven times shows what the shop paid for the shoe, for
// five seconds. The figure is never rendered into the page — it is fetched
// only when the taps succeed, so it can't be read from the page source.
export default function CostReveal({
  src,
  alt,
  code,
}: {
  src: string | null;
  alt: string;
  code: string;
}) {
  const { revealed, tap } = useSecretReveal(async () => {
    try {
      const res = await fetch(
        `/api/footwear/cost?code=${encodeURIComponent(code)}`
      );
      if (!res.ok) return { price: null };
      return { price: (await res.json()).purchasePrice ?? null };
    } catch {
      return { price: null };
    }
  });

  return (
    <div className="relative select-none" onClick={tap}>
      <FootwearImage
        src={src}
        alt={alt}
        className="aspect-square w-full rounded-2xl border border-cream-dark bg-card"
      />

      {revealed && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-ink/90 px-4 py-3 text-center shadow-lg">
          <p className="text-xs uppercase tracking-wide text-gold">
            Purchase price
          </p>
          <p className="text-2xl font-bold text-cream">
            {revealed.price != null ? formatPrice(revealed.price) : "not recorded"}
          </p>
          <p className="text-[11px] text-cream/60">hides in 5 seconds</p>
        </div>
      )}
    </div>
  );
}
