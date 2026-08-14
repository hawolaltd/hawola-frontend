"use client";

import React from "react";
import Link from "next/link";
import { featuredImageCardUrl, formatCurrency } from "@/util";
import type { ProductFull } from "@/types/home";

export function BestSellersLeaderboard({
  products,
  tone = "dark",
  title = "Best sellers",
  limit = 8,
  compact = false,
}: {
  products: ProductFull[];
  tone?: "dark" | "light";
  title?: string;
  limit?: number;
  /** Tighter rows so more ranks fit without dominating the layout. */
  compact?: boolean;
}) {
  const list = products.filter(Boolean).slice(0, limit);
  if (!list.length) return null;

  const isDark = tone === "dark";
  const pad = compact ? "p-3.5" : "p-5";
  const rankSize = compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  const thumb = compact ? "h-10 w-10 rounded-md" : "h-14 w-14 rounded-lg";
  const titleCls = compact
    ? "line-clamp-1 text-xs font-semibold leading-snug"
    : "line-clamp-2 text-sm font-semibold leading-snug";
  const priceCls = compact
    ? "mt-0.5 text-xs font-bold tabular-nums"
    : "mt-0.5 text-sm font-bold tabular-nums";
  const gap = compact ? "gap-2" : "gap-3";
  const listGap = compact ? "space-y-2" : "space-y-3";

  return (
    <div
      className={
        isDark
          ? `h-full rounded-2xl border border-white/15 ${pad}`
          : `h-full rounded-2xl border border-slate-200 bg-white ${compact ? "p-3" : "p-4"} shadow-sm`
      }
      style={
        isDark
          ? { background: "linear-gradient(165deg, #0B1B33 0%, #163456 100%)" }
          : undefined
      }
    >
      <h3
        className={
          isDark
            ? `mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]`
            : `mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary`
        }
        style={isDark ? { color: "#ffffff" } : undefined}
      >
        {title}
      </h3>
      <ol className={listGap}>
        {list.map((product, index) => {
          const href = product.slug ? `/product/${product.slug}` : "#";
          const hasDiscount =
            product?.discount_price != null &&
            product?.price != null &&
            String(product.discount_price).trim() !== "" &&
            String(product.discount_price) !== String(product.price);
          return (
            <li key={product.id ?? index}>
              <Link
                href={href}
                className={`group flex items-center ${gap} no-underline`}
                style={{ color: isDark ? "#f8fafc" : "inherit" }}
              >
                <span
                  className={
                    isDark
                      ? `flex ${rankSize} shrink-0 items-center justify-center rounded-full font-bold`
                      : `flex ${rankSize} shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 ring-1 ring-slate-200`
                  }
                  style={
                    isDark
                      ? {
                          background: "rgba(254, 150, 54, 0.22)",
                          color: "#fed7aa",
                          boxShadow: "inset 0 0 0 1px rgba(253, 186, 116, 0.35)",
                        }
                      : undefined
                  }
                >
                  {index + 1}
                </span>
                <div className={`${thumb} shrink-0 overflow-hidden bg-slate-200/80`}>
                  <img
                    src={featuredImageCardUrl(product.featured_image?.[0])}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      isDark
                        ? titleCls
                        : `${titleCls} text-primary`
                    }
                    style={isDark ? { color: "#f8fafc" } : undefined}
                  >
                    {product.name}
                  </p>
                  <p
                    className={
                      isDark
                        ? priceCls
                        : `${priceCls} text-slate-800`
                    }
                    style={isDark ? { color: "#fdba74" } : undefined}
                  >
                    {formatCurrency(hasDiscount ? product.discount_price : product.price)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
