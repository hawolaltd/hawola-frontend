import React from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  MAX_COMPARE_PRODUCTS,
  toggleCompareProduct,
} from "@/redux/product/productSlice";
import type { Product } from "@/types/product";
import type { ProductFull } from "@/types/home";
import { toast } from "sonner";

/** Store listing/detail payloads in compare list (Redux expects Product shape). */
export function normalizeProductForCompare(p: ProductFull | Product): Product {
  return { ...(p as unknown as Product) };
}

type Props = {
  product: ProductFull | Product;
  /** Card: small icon-style. Detail: text link row */
  variant?: "icon" | "inline";
  className?: string;
};

export default function AddToCompareButton({
  product,
  variant = "icon",
  className = "",
}: Props) {
  const dispatch = useAppDispatch();
  const compareProducts = useAppSelector((s) => s.products.compareProducts);
  const compareList = Array.isArray(compareProducts) ? compareProducts : [];
  const id = product.id;
  const isIn = compareList.some((p) => p.id === id);
  const count = compareList.length;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = normalizeProductForCompare(product);
    if (!isIn && count >= MAX_COMPARE_PRODUCTS) {
      toast.error(
        `You can compare up to ${MAX_COMPARE_PRODUCTS} products. Remove one to add another.`
      );
      return;
    }
    dispatch(toggleCompareProduct(payload));
    if (!isIn) {
      toast.success("Added to compare");
    } else {
      toast.message("Removed from compare");
    }
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 text-left ${className}`}
      >
        <span className="flex items-center justify-center rounded border border-[#dde4f0] p-0.5">
          <img src="/assets/compare.svg" alt="" className="h-4 w-4" width={16} height={16} />
        </span>
        <span className="cursor-pointer text-xs font-medium text-primary">
          {isIn ? "Remove from compare" : "Add to compare"}
        </span>
      </button>
    );
  }

  const label = isIn ? "Remove from compare" : "Add to compare";

  return (
    <div className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`z-10 flex h-8 w-8 items-center justify-center rounded-md border shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isIn
            ? "border-secondaryTextColor bg-emerald-50 text-secondaryTextColor"
            : "border-[#dde4f0] bg-white text-primary hover:border-primary/40"
        }`}
      >
        <img src="/assets/compare.svg" alt="" className="h-4 w-4" width={16} height={16} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-[60] ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
