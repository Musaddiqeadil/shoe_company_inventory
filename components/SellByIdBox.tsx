"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Shortcut on the sold list: type a code or S-number and go straight to that
// shoe's sell page, without hunting for it on the home screen first.
export default function SellByIdBox() {
  const router = useRouter();
  const [id, setId] = useState("");

  function go() {
    const trimmed = id.trim();
    if (trimmed) router.push(`/sell/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="flex gap-2 rounded-2xl border border-cream-dark bg-card p-4 shadow-sm">
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            go();
          }
        }}
        placeholder="Sell by shoe ID — e.g. SPT-115 or S12"
        className="w-full rounded-lg border border-cream-dark bg-card px-3 py-2 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
      <button
        type="button"
        onClick={go}
        disabled={!id.trim()}
        className="shrink-0 rounded-lg bg-gold px-5 py-2 font-semibold text-ink hover:bg-gold-dark disabled:opacity-50"
      >
        Sell
      </button>
    </div>
  );
}
