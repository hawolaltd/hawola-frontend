type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export default function PromoPagination({ page, totalPages, onPageChange, loading }: Props) {
  if (totalPages <= 1) return null;

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let p = windowStart; p <= windowEnd; p += 1) {
    pages.push(p);
  }

  const btnClass = (active: boolean) =>
    `min-w-[2.5rem] rounded-full px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
        : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50"
    } disabled:opacity-50`;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Promo products pagination"
    >
      <button
        type="button"
        className={btnClass(false)}
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>
      {windowStart > 1 ? (
        <>
          <button type="button" className={btnClass(false)} disabled={loading} onClick={() => onPageChange(1)}>
            1
          </button>
          {windowStart > 2 ? <span className="px-1 text-slate-400">…</span> : null}
        </>
      ) : null}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={btnClass(p === page)}
          disabled={loading}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      {windowEnd < totalPages ? (
        <>
          {windowEnd < totalPages - 1 ? <span className="px-1 text-slate-400">…</span> : null}
          <button
            type="button"
            className={btnClass(false)}
            disabled={loading}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      ) : null}
      <button
        type="button"
        className={btnClass(false)}
        disabled={loading || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
