"use client";

import React from "react";
import Link from "next/link";
import { saveProductDetailPreview } from "@/lib/pdpPreview";
import { featuredImageCardUrl, formatCurrency } from "@/util";
import { formatProductCardTitle } from "@/util/formatProductCardTitle";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import type { ProductFull } from "@/types/home";

export type CompactProductTileProduct = {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
  price?: string | number | null;
  discount_price?: string | number | null;
  featured_image?: unknown;
  merchant?: { store_name?: string | null } | null;
};

function productHref(product: CompactProductTileProduct): string {
  const slug = product?.slug?.trim();
  if (!slug) return "#";
  return slug.startsWith("/") ? slug : `/product/${slug}`;
}

/**
 * Compact square product tile (Today's movers style).
 * `dark` for navy bands; `light` for PDP related / search grids.
 */
export default function CompactProductTile({
  product,
  tone = "light",
  rank,
  showCompare = false,
  isPromoted = false,
}: {
  product: CompactProductTileProduct;
  tone?: "light" | "dark";
  rank?: number;
  showCompare?: boolean;
  isPromoted?: boolean;
}) {
  const href = productHref(product);
  const isDark = tone === "dark";
  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  const onPreview = () => {
    saveProductDetailPreview(product as ProductFull);
  };

  const shellClass = isDark
    ? "group relative overflow-hidden rounded-xl transition duration-300 hover:-translate-y-0.5"
    : "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md";

  const shellStyle = isDark
    ? {
        background: "rgba(255,255,255,0.06)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }
    : undefined;

  return (
    <div className={shellClass} style={shellStyle}>
      <div
        className={
          isDark
            ? "relative aspect-square overflow-hidden bg-slate-800/40"
            : "relative aspect-square overflow-hidden bg-slate-100"
        }
      >
        {typeof rank === "number" ? (
          <span
            className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "rgba(254, 150, 54, 0.95)",
              color: "#0B1B33",
            }}
          >
            {rank}
          </span>
        ) : null}
        {showCompare && !isDark ? (
          <AddToCompareButton
            product={product as ProductFull}
            className="absolute left-2 top-2 z-20"
            accent="light"
            tooltipPlacement="bottom"
          />
        ) : null}
        {isPromoted ? (
          <span className="absolute right-2 top-2 z-20 flex h-4 items-center justify-center rounded-full bg-yellow-500 px-2 text-[10px] font-semibold text-white">
            Promoted
          </span>
        ) : null}
        <Link
          href={href}
          className="absolute inset-0 block"
          aria-label={product.name || "Product"}
          onClick={onPreview}
        >
          <img
            src={featuredImageCardUrl(
              Array.isArray(product.featured_image)
                ? product.featured_image[0]
                : product.featured_image
            )}
            alt={product.name || ""}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>
      <Link href={href} onClick={onPreview} className="block space-y-0.5 p-2.5 no-underline sm:p-3">
        {!isDark && product.merchant?.store_name ? (
          <p className="line-clamp-1 text-[10px] font-semibold text-textPadded">
            {product.merchant.store_name}
          </p>
        ) : null}
        <p
          className={
            isDark
              ? "line-clamp-2 text-xs font-semibold leading-snug"
              : "line-clamp-2 text-xs font-semibold leading-snug text-primary"
          }
          style={isDark ? { color: "#f8fafc" } : undefined}
        >
          {formatProductCardTitle(product.name)}
        </p>
        <p
          className={
            isDark
              ? "text-sm font-bold tabular-nums"
              : "text-sm font-bold tabular-nums text-slate-900"
          }
          style={isDark ? { color: "#fdba74" } : undefined}
        >
          {formatCurrency(hasDiscount ? product.discount_price : product.price)}
          {hasDiscount && !isDark ? (
            <span className="ml-1.5 text-[11px] font-medium text-slate-400 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </p>
      </Link>
    </div>
  );
}
