import React from "react";
import ProductCard2 from "@/components/product/ProductCard2";
import type { ProductFull } from "@/types/home";

interface ProductRankPanelProps {
  title: string;
  products: ProductFull[];
  limit?: number;
  className?: string;
}

/**
 * Orange-header vertical product list (Best Seller / Top Selling style).
 */
export default function ProductRankPanel({
  title,
  products,
  limit = 5,
  className = "",
}: ProductRankPanelProps) {
  const list = products.filter(Boolean).slice(0, limit);
  if (!list.length) return null;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#d9e3f0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${className}`.trim()}
    >
      <div className="flex min-h-[3.25rem] items-center bg-[#fe9636] px-4 py-3">
        <h4 className="text-lg font-semibold tracking-tight text-white">{title}</h4>
      </div>
      <div className="bg-white">
        {list.map((item, key) => (
          <ProductCard2 key={item.id ?? key} product={list} index={key} item={item} />
        ))}
      </div>
    </div>
  );
}
