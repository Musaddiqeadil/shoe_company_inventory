"use client";

import { useState } from "react";
import Link from "next/link";
import FootwearCard from "@/components/FootwearCard";
import { CATEGORIES } from "@/lib/constants";

type Item = {
  code: string;
  name: string;
  category: string;
  sellingPrice: number;
  imageUrl: string | null;
  sizes: { size: number; quantity: number }[];
};

// "All" plus the 7 categories, used as filter tabs on the home page.
const TABS = ["All", ...CATEGORIES] as const;

// Home-page browser: a live search box + category tabs that filter the full
// shoe list instantly (no button, no page reload).
export default function FootwearBrowser({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const q = query.trim().toLowerCase();

  const filtered = items.filter((it) => {
    const inTab = tab === "All" || it.category === tab;
    // Match shoes whose name or code STARTS WITH what you typed.
    const matchesSearch =
      !q ||
      it.name.toLowerCase().startsWith(q) ||
      it.code.toLowerCase().startsWith(q);
    return inTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-cream-dark bg-card p-6 sm:p-10 shadow-sm">
        <h1 className="wordmark text-2xl sm:text-3xl text-ink">
          Find any footwear
        </h1>
        <p className="mt-2 text-ink-soft">
          Start typing a name or code — results appear instantly.
        </p>
        <div className="mt-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code, e.g. Nike or SPT-115"
            autoFocus
            className="w-full rounded-lg border border-cream-dark bg-card px-4 py-3 text-lg text-ink shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "border-gold bg-gold text-ink"
                    : "border-cream-dark bg-card text-ink hover:border-gold hover:text-gold-dark")
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {tab === "All" ? "All footwear" : tab}
            {q && " — search results"}
          </h2>
          <span className="text-sm text-ink-soft">
            {filtered.length} item(s)
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
            <p>No footwear added yet.</p>
            <Link
              href="/admin/new"
              className="mt-4 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-gold-dark"
            >
              Add your first shoe
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-cream-dark bg-card p-8 text-center text-ink-soft">
            No footwear here{q ? ` matching “${query}”` : ""}.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <FootwearCard key={item.code} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
