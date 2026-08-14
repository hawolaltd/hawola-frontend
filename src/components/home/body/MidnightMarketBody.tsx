"use client";

import React from "react";
import AppStoreBadges from "@/components/home/hero/AppStoreBadges";
import CompactProductTile from "@/components/product/CompactProductTile";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { ProductFull } from "@/types/home";
import { DarkProductBand } from "./DarkProductBand";
import { HomeBodyAdvertBanners } from "./HomeBodyAdvertBanners";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { ProductGrid } from "./ProductSnapRail";
import { getHomeProductPools } from "./homePools";

/** Ranked product tiles — even grid on the navy band (no nested dark card). */
function TodaysMoversGrid({ products }: { products: ProductFull[] }) {
  const list = products.filter(Boolean).slice(0, 12);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-3.5">
      {list.map((product, index) => (
        <CompactProductTile
          key={product.id ?? index}
          product={product}
          tone="dark"
          rank={index + 1}
        />
      ))}
    </div>
  );
}

/**
 * Midnight market — balanced product grids + redesigned movers band.
 */
export default function MidnightMarketBody() {
  const { homePage, siteSettings } = useAppSelector((state) => state.general);
  const pools = getHomeProductPools(homePage?.data as Record<string, unknown> | undefined);
  const playStoreUrl = (siteSettings?.play_store_url as string | null | undefined) ?? null;
  const appStoreUrl = (siteSettings?.app_store_url as string | null | undefined) ?? null;
  const movers = pools.bestSelling.length ? pools.bestSelling : pools.topSelling;
  const showMoversBand = movers.length > 0 || playStoreUrl || appStoreUrl;

  return (
    <div className="w-full">
      {pools.specials.length > 0 ? (
        <section className="bg-slate-50 py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="Hand-picked" title="Hawola Specials" />
            <ProductGrid products={pools.specials.slice(0, 10)} />
          </div>
        </section>
      ) : null}

      {showMoversBand ? (
        <DarkProductBand>
          <HomeSectionHeader
            tone="dark"
            eyebrow="Trending now"
            title="Today's movers"
            action={
              <div className="hidden sm:block">
                <AppStoreBadges
                  playStoreUrl={playStoreUrl}
                  appStoreUrl={appStoreUrl}
                  variant="inline"
                  tone="dark"
                  layout="badgesOnly"
                  align="start"
                />
              </div>
            }
          />
          {movers.length > 0 ? <TodaysMoversGrid products={movers} /> : null}
          <div className="mt-5 sm:hidden">
            <AppStoreBadges
              playStoreUrl={playStoreUrl}
              appStoreUrl={appStoreUrl}
              variant="inline"
              tone="dark"
              layout="badgesOnly"
              align="start"
            />
          </div>
        </DarkProductBand>
      ) : null}

      {pools.recommended.length > 0 ? (
        <section className="py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="For you" title="Recommended" />
            <ProductGrid products={pools.recommended.slice(0, 10)} />
          </div>
        </section>
      ) : null}

      <HomeBodyAdvertBanners middle={pools.advertMiddle} bottom={pools.advertBottom} />

      {pools.topRated.length > 0 ? (
        <section className="bg-[#E8EDF3] pt-10">
          <div className="mx-auto max-w-screen-xl px-6 pb-10 xl:px-0 sm:pb-12">
            <HomeSectionHeader eyebrow="Trusted" title="Top rated" />
            <ProductGrid products={pools.topRated.slice(0, 15)} />
          </div>
          <RecentlyViewedSection />
        </section>
      ) : (
        <div className="bg-[#E8EDF3]">
          <RecentlyViewedSection />
        </div>
      )}
    </div>
  );
}
