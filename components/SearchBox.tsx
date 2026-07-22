"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Big code-lookup box on the home page. On submit it navigates to the
// item page for that code.
export default function SearchBox() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/item/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter footwear code, e.g. SPT-115"
          autoFocus
          className="flex-1 rounded-lg border border-cream-dark bg-card px-4 py-3 text-lg text-ink shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-3 text-lg font-semibold text-ink shadow-sm transition-colors hover:bg-gold-dark"
        >
          Search
        </button>
      </div>
    </form>
  );
}
