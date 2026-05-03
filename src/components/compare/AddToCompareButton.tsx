import React, { useState } from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";
import { HI_SM } from "@/lib/hawolaIconTheme";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  MAX_COMPARE_PRODUCTS,
  toggleCompareProduct,
} from "@/redux/product/productSlice";
import type { Product } from "@/types/product";
import type { ProductFull } from "@/types/home";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/config";

/** Store listing/detail payloads in compare list (Redux expects Product shape). */
export function normalizeProductForCompare(p: ProductFull | Product): Product {
  return { ...(p as unknown as Product) };
}

type Props = {
  product: ProductFull | Product;
  /** Card: small icon-style. Detail: text link row */
  variant?: "icon" | "inline";
  className?: string;
  /**
   * Icon variant only: where the hover label appears.
   * `bottom` suits top-right anchored controls on product cards.
   */
  tooltipPlacement?: "right" | "top" | "bottom";
  /** Solid light chip on photos (opaque; no frost/blur). */
  accent?: "default" | "light";
};

export default function AddToCompareButton({
  product,
  variant = "icon",
  className = "",
  tooltipPlacement = "right",
  accent = "default",
}: Props) {
  const dispatch = useAppDispatch();
  const compareProducts = useAppSelector((s) => s.products.compareProducts);
  const compareList = Array.isArray(compareProducts) ? compareProducts : [];
  const id = product.id;
  const isIn = compareList.some((p) => p.id === id);
  const count = compareList.length;
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const payload = normalizeProductForCompare(product);
    if (!isIn && count >= MAX_COMPARE_PRODUCTS) {
      toast.error(
        `You can compare up to ${MAX_COMPARE_PRODUCTS} products. Remove one to add another.`
      );
      return;
    }
    dispatch(toggleCompareProduct(payload));
    if (!isIn) {
      setBusy(true);
      try {
        await fetch(`${getApiUrl()}/api/products/track-compare/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id }),
        });
      } catch {
        /* non-blocking */
      } finally {
        setBusy(false);
      }
      toast.success("Added to compare");
    } else {
      toast.message("Removed from compare");
    }
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={(e) => void handleClick(e)}
        disabled={busy}
        className={`flex items-center gap-2 text-left disabled:cursor-wait disabled:opacity-70 ${className}`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 p-1">
          {busy ? (
            <InlineButtonSpinner className={`${HI_SM} text-primary`} />
          ) : (
            <ArrowsRightLeftIcon className={`${HI_SM} text-primary`} aria-hidden />
          )}
        </span>
        <span className="cursor-pointer text-xs font-medium text-primary">
          {busy ? "Updating…" : isIn ? "Remove from compare" : "Add to compare"}
        </span>
      </button>
    );
  }

  const label = isIn ? "Remove from compare" : "Add to compare";

  const tooltipBase =
    "pointer-events-none absolute z-[60] whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100";
  let tooltipClass: string;
  if (tooltipPlacement === "top") {
    tooltipClass = `${tooltipBase} bottom-full left-1/2 mb-2 -translate-x-1/2`;
  } else if (tooltipPlacement === "bottom") {
    tooltipClass = `${tooltipBase} left-1/2 top-full mt-2 -translate-x-1/2`;
  } else {
    tooltipClass = `${tooltipBase} left-full top-1/2 ml-2 -translate-y-1/2`;
  }

  const lightIconInactive =
    "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus-visible:ring-slate-400/45";
  const lightIconActive =
    "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-100 focus-visible:ring-emerald-500/35";
  const defaultIconInactive =
    "rounded-lg border-slate-200/90 bg-slate-50 text-primary hover:border-primary/40";
  const defaultIconActive =
    "rounded-lg border-secondaryTextColor bg-emerald-50 text-secondaryTextColor";

  const iconButtonTone =
    accent === "light"
      ? isIn
        ? lightIconActive
        : lightIconInactive
      : isIn
        ? defaultIconActive
        : defaultIconInactive;

  const focusRingLight =
    accent === "light"
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      : "focus-visible:ring-2 focus-visible:ring-primary/50";

  const spinnerMuted = accent === "light" ? "text-slate-400" : "";

  return (
    <div className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(e) => void handleClick(e)}
        disabled={busy}
        aria-label={busy ? "Updating compare list" : label}
        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center border shadow-sm transition hover:scale-105 focus:outline-none disabled:cursor-wait disabled:hover:scale-100 ${accent === "light" ? "rounded-full" : ""} ${focusRingLight} ${iconButtonTone}`}
      >
        {busy ? (
          <InlineButtonSpinner className={`${HI_SM} ${spinnerMuted}`} />
        ) : (
          <ArrowsRightLeftIcon className={HI_SM} aria-hidden />
        )}
      </button>
      <span role="tooltip" className={tooltipClass}>
        {label}
      </span>
    </div>
  );
}
