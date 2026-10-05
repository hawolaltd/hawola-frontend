type Props = {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export default function StoreProductPagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  loading,
}: Props) {
  if (count <= 0 || totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let current = windowStart; current <= windowEnd; current += 1) {
    pages.push(current);
  }

  const buttonClass = (active: boolean) =>
    `min-w-10 rounded-full px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-slate-950 text-white"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    } disabled:opacity-50`;

  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label="Store products">
      <p className="text-sm text-slate-500">
        Showing {start}–{end} of {count}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className={buttonClass(false)}
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        {windowStart > 1 ? (
          <>
            <button type="button" className={buttonClass(false)} disabled={loading} onClick={() => onPageChange(1)}>
              1
            </button>
            {windowStart > 2 ? <span className="px-1 text-slate-400">…</span> : null}
          </>
        ) : null}
        {pages.map((current) => (
          <button
            key={current}
            type="button"
            className={buttonClass(current === page)}
            disabled={loading}
            onClick={() => onPageChange(current)}
            aria-current={current === page ? "page" : undefined}
          >
            {current}
          </button>
        ))}
        {windowEnd < totalPages ? (
          <>
            {windowEnd < totalPages - 1 ? <span className="px-1 text-slate-400">…</span> : null}
            <button
              type="button"
              className={buttonClass(false)}
              disabled={loading}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        ) : null}
        <button
          type="button"
          className={buttonClass(false)}
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
