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

/** Grid pages with arrows + touch swipe between pages. */
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

  return (
    <div
      className="relative touch-pan-y"
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <RailNavButtons
        show={totalPages > 1}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
      />

      <ProductGrid products={visible} columnsClass={columnsClass} />

      {totalPages > 1 ? (
        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          {safePage + 1} / {totalPages}
          <span className="ml-2 font-normal text-slate-400 sm:hidden">Swipe for more</span>
        </p>
      ) : null}
    </div>
  );
}
