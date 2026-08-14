"use client";

import React from "react";
import Link from "next/link";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";
import { useAppSelector } from "@/hook/useReduxTypes";
import { featuredImageCardUrl, formatCurrency } from "@/util";
import { formatProductCardTitle } from "@/util/formatProductCardTitle";
import type { ProductFull } from "@/types/home";
import { DarkProductBand } from "./DarkProductBand";
import { HomeBodyAdvertBanners } from "./HomeBodyAdvertBanners";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { PaginatedProductGrid, ProductGrid, ProductSnapRail } from "./ProductSnapRail";
import { RailNavButtons, useHorizontalRailScroll } from "./useHorizontalRailScroll";
import { getHomeProductPools } from "./homePools";

const FEATURED_COUNT = 12;
const FEATURED_OFFSET = FEATURED_COUNT;

/** Equal featured tiles — 6 per row, two rows. */
function FeaturedDeals({ products }: { products: ProductFull[] }) {
  const list = products.slice(0, FEATURED_COUNT);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-6">
      {list.map((product, index) => {
        const href = product.slug ? `/product/${product.slug}` : "#";
        const hasDiscount =
          product?.discount_price != null &&
          product?.price != null &&
          String(product.discount_price).trim() !== "" &&
          String(product.discount_price) !== String(product.price);
        return (
          <Link
            key={product.id ?? index}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm no-underline"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              {index === 0 ? (
                <span
                  className="absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{ background: "#0B1B33", color: "#fff" }}
                >
                  Featured
                </span>
              ) : null}
              <img
                src={featuredImageCardUrl(product.featured_image?.[0])}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
            <div className="space-y-0.5 p-2.5 sm:p-3">
              <p className="line-clamp-2 text-xs font-semibold text-primary">
                {formatProductCardTitle(product.name)}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(hasDiscount ? product.discount_price : product.price)}
                {hasDiscount ? (
                  <span className="ml-1.5 text-[11px] font-medium text-slate-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                ) : null}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function NumberedBestRail({ products }: { products: ProductFull[] }) {
  const list = products.slice(0, 20);
  const { canPrev, canNext, scrollByDir, railProps } = useHorizontalRailScroll([list]);

  if (!list.length) return null;

  return (
    <div className="relative">
      <RailNavButtons
        show={list.length > 2}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => scrollByDir(-1)}
        onNext={() => scrollByDir(1)}
      />
      <div {...railProps}>
        {list.map((product, index) => {
          const href = product.slug ? `/product/${product.slug}` : "#";
          const hasDiscount =
            product?.discount_price != null &&
            product?.price != null &&
            String(product.discount_price).trim() !== "" &&
            String(product.discount_price) !== String(product.price);
          return (
            <Link
              key={product.id ?? index}
              href={href}
              draggable={false}
              className="group relative w-[180px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm no-underline sm:w-[190px]"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <span
                  className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "#0B1B33", color: "#ffffff" }}
                >
                  {index + 1}
                </span>
                <img
                  src={featuredImageCardUrl(product.featured_image?.[0])}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-2 text-xs font-semibold text-primary">
                  {formatProductCardTitle(product.name)}
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(hasDiscount ? product.discount_price : product.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DealRunwayBody() {
  const { homePage } = useAppSelector((state) => state.general);
  const pools = getHomeProductPools(homePage?.data as Record<string, unknown> | undefined);
  const featuredSource = pools.specials.length ? pools.specials : pools.recommended;
  const specialsAfterFeatured = pools.specials.slice(FEATURED_OFFSET);

  return (
    <div className="w-full">
      {featuredSource.length > 0 ? (
        <section className="bg-slate-50 py-8 sm:py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="Runway" title="Featured deals" />
            <FeaturedDeals products={featuredSource} />
          </div>
        </section>
      ) : null}

      {pools.topRated.length > 0 ? (
        <DarkProductBand>
          <HomeSectionHeader tone="dark" eyebrow="Today's picks" title="Top rated" />
          <p className="mb-5 max-w-xl text-sm" style={{ color: "#cbd5e1" }}>
            Shoppers love these — swipe the rail or use the arrows.
          </p>
          <ProductSnapRail products={pools.topRated} />
        </DarkProductBand>
      ) : null}

      {pools.recommended.length > 0 ? (
        <section className="py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="For you" title="Recommended" />
            <PaginatedProductGrid products={pools.recommended} pageSize={10} />
          </div>
        </section>
      ) : null}

      {(pools.bestSelling.length > 0 || pools.topSelling.length > 0) ? (
        <section className="bg-[#E8EDF3] py-10 sm:py-12">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="Ranked" title="Best sellers" />
            <NumberedBestRail
              products={pools.bestSelling.length ? pools.bestSelling : pools.topSelling}
            />
          </div>
        </section>
      ) : null}

      <HomeBodyAdvertBanners middle={pools.advertMiddle} bottom={pools.advertBottom} />

      {specialsAfterFeatured.length > 0 ? (
        <section className="border-t border-slate-200 py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="More" title="Hawola Specials" />
            <ProductGrid products={specialsAfterFeatured.slice(0, 15)} />
          </div>
        </section>
      ) : null}

      <RecentlyViewedSection />
    </div>
  );
}
