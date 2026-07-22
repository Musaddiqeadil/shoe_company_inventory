import Link from "next/link";

// Simple page navigation. Links to `${basePath}?page=N` (page 1 drops the
// param). Shows Prev/Next plus windowed page numbers with ellipses.
export default function Pagination({
  page,
  totalPages,
  basePath = "/",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);

  // Build the list of page numbers to show (with 1 as ellipsis marker: -1).
  const pages: number[] = [];
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };
  add(1);
  for (let p = page - 1; p <= page + 1; p++) add(p);
  add(totalPages);
  pages.sort((a, b) => a - b);

  const withEllipses: (number | "…")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (prev && p - prev > 1) withEllipses.push("…");
    withEllipses.push(p);
    prev = p;
  }

  const base =
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={base + " border-cream-dark bg-card text-ink hover:border-gold"}
        >
          ← Prev
        </Link>
      ) : (
        <span className={base + " border-cream-dark bg-cream-dark/40 text-ink-soft"}>
          ← Prev
        </span>
      )}

      {withEllipses.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink-soft">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className={
              base +
              (p === page
                ? " border-gold bg-gold font-semibold text-ink"
                : " border-cream-dark bg-card text-ink hover:border-gold")
            }
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className={base + " border-cream-dark bg-card text-ink hover:border-gold"}
        >
          Next →
        </Link>
      ) : (
        <span className={base + " border-cream-dark bg-cream-dark/40 text-ink-soft"}>
          Next →
        </span>
      )}
    </nav>
  );
}
