"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { ProductFull } from "@/types/home";
import {
  RailNavButtons,
  useHorizontalRailScroll,
  usePageSwipe,
} from "./useHorizontalRailScroll";

const DEFAULT_GRID =
  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export function ProductSnapRail({
  products,
  cardClassName = "w-[42vw] max-w-[190px] sm:w-[180px]",
}: {
  products: ProductFull[];
  cardClassName?: string;
}) {
  const { canPrev, canNext, scrollByDir, railProps } = useHorizontalRailScroll([products]);

  if (!products.length) return null;

  return (
    <div className="relative">
      <RailNavButtons
        show={products.length > 2}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => scrollByDir(-1)}
        onNext={() => scrollByDir(1)}
      />
      <div {...railProps}>
        {products.map((product, key) => (
          <div key={product.id ?? key} className={`shrink-0 snap-start ${cardClassName}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  columnsClass = DEFAULT_GRID,
}: {
  products: ProductFull[];
  columnsClass?: string;
}) {
  if (!products.length) return null;
  return (
    <div className={`grid w-full gap-3 sm:gap-4 ${columnsClass}`}>
      {products.map((product, key) => (
        <ProductCard key={product.id ?? key} product={product} />
      ))}
    </div>
  );
}

/** Grid pages with full-height side nav, top arrows, dots, and swipe. */
export function PaginatedProductGrid({
  products,
  pageSize = 10,
  columnsClass = DEFAULT_GRID,
}: {
  products: ProductFull[];
  pageSize?: number;
  columnsClass?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const visible = products.slice(start, start + pageSize);
  const swipe = usePageSwipe(safePage, totalPages, setPage);

  useEffect(() => {
    setPage(0);
  }, [products]);

  if (!products.length) return null;

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;
  const multi = totalPages > 1;

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="relative">
      {multi ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={!canPrev}
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={!canNext}
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tabular-nums text-slate-600">
              Page {safePage + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => setPage(i)}
                  className={`h-2 rounded-full transition ${
                    i === safePage ? "w-5 bg-[#0B1B33]" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="relative touch-pan-y select-none"
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
      >
        {multi ? (
          <>
            <button
              type="button"
              aria-label="Previous page"
              disabled={!canPrev}
              onClick={goPrev}
              className="absolute inset-y-0 left-0 z-20 flex w-10 items-center justify-center rounded-l-xl border-0 bg-gradient-to-r from-slate-100/95 via-slate-50/70 to-transparent text-slate-700 transition hover:from-slate-200/95 disabled:pointer-events-none disabled:opacity-25 sm:w-12"
            >
              <span className="flex h-11 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={!canNext}
              onClick={goNext}
              className="absolute inset-y-0 right-0 z-20 flex w-10 items-center justify-center rounded-r-xl border-0 bg-gradient-to-l from-slate-100/95 via-slate-50/70 to-transparent text-slate-700 transition hover:from-slate-200/95 disabled:pointer-events-none disabled:opacity-25 sm:w-12"
            >
              <span className="flex h-11 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </>
        ) : null}

        <div className={multi ? "px-10 sm:px-12" : undefined}>
          <ProductGrid products={visible} columnsClass={columnsClass} />
        </div>
      </div>

      {multi ? (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === safePage ? "page" : undefined}
                onClick={() => setPage(i)}
                className={`h-2.5 rounded-full transition ${
                  i === safePage ? "w-6 bg-[#fe9636]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-slate-500">
            Swipe sideways or use the side arrows for more products
          </p>
        </div>
      ) : null}
    </div>
  );
}
