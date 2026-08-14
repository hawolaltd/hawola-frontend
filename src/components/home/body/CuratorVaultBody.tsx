"use client";

import React, { useMemo } from "react";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { ProductFull } from "@/types/home";
import { HomeBodyAdvertBanners } from "./HomeBodyAdvertBanners";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { BestSellersLeaderboard } from "./BestSellersLeaderboard";
import { ProductGrid } from "./ProductSnapRail";
import { getHomeProductPools, type HomeProductPools } from "./homePools";

const EDITOR_COUNT = 8;
const MORE_RECOMMENDED_COUNT = 15;

function productKey(p: ProductFull): string | number | null {
  return p?.id ?? p?.slug ?? null;
}

/** Fill the bottom Recommended grid to a full count without repeating editor picks. */
function moreRecommendedProducts(
  pools: HomeProductPools,
  editorPicks: ProductFull[],
  count: number
): ProductFull[] {
  const used = new Set(
    editorPicks.map(productKey).filter((k): k is string | number => k != null)
  );
  const out: ProductFull[] = [];

  const pushFrom = (source: ProductFull[]) => {
    for (const p of source) {
      const key = productKey(p);
      if (key == null || used.has(key)) continue;
      used.add(key);
      out.push(p);
      if (out.length >= count) return;
    }
  };

  // Prefer leftover recommended, then other home pools so the section stays full.
  pushFrom(pools.recommended.slice(EDITOR_COUNT));
  if (out.length < count) pushFrom(pools.specials);
  if (out.length < count) pushFrom(pools.topRated);
  if (out.length < count) pushFrom(pools.bestSelling);
  if (out.length < count) pushFrom(pools.topSelling);
  if (out.length < count) pushFrom(pools.recommended.slice(0, EDITOR_COUNT));

  return out;
}

/**
 * Curator vault — compact ranking + editor picks, then denser product grids.
 */
export default function CuratorVaultBody() {
  const { homePage } = useAppSelector((state) => state.general);
  const pools = getHomeProductPools(homePage?.data as Record<string, unknown> | undefined);
  const vaultList = pools.bestSelling.length ? pools.bestSelling : pools.topSelling;
  const editorPicks = pools.recommended.slice(0, EDITOR_COUNT);
  const moreRecommended = useMemo(
    () => moreRecommendedProducts(pools, editorPicks, MORE_RECOMMENDED_COUNT),
    [pools, editorPicks]
  );

  return (
    <div className="w-full bg-slate-50/80">
      {(vaultList.length > 0 || editorPicks.length > 0) ? (
        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
              {vaultList.length > 0 ? (
                <div className="flex flex-col lg:col-span-3">
                  <HomeSectionHeader eyebrow="Curated" title="The vault" />
                  <BestSellersLeaderboard
                    products={vaultList}
                    tone="dark"
                    title="Vault ranking"
                    limit={12}
                    compact
                  />
                </div>
              ) : null}
              {editorPicks.length > 0 ? (
                <div
                  className={`flex flex-col ${
                    vaultList.length ? "lg:col-span-9" : "lg:col-span-12"
                  }`}
                >
                  <HomeSectionHeader eyebrow="Hand-chosen" title="Editor's selection" />
                  <ProductGrid
                    products={editorPicks}
                    columnsClass="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {pools.specials.length > 0 ? (
        <section className="bg-[#E8EDF3] py-10 sm:py-12">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="Hand-picked" title="Hawola Specials" />
            <ProductGrid products={pools.specials.slice(0, 10)} />
          </div>
        </section>
      ) : null}

      <HomeBodyAdvertBanners middle={pools.advertMiddle} bottom={pools.advertBottom} />

      {pools.topRated.length > 0 ? (
        <section className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="Trusted" title="Top rated" />
            <ProductGrid products={pools.topRated.slice(0, 15)} />
          </div>
        </section>
      ) : null}

      {moreRecommended.length > 0 ? (
        <section className="bg-[#E8EDF3] py-10 sm:py-12">
          <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
            <HomeSectionHeader eyebrow="More for you" title="Recommended" />
            <ProductGrid products={moreRecommended} />
          </div>
        </section>
      ) : null}

      <RecentlyViewedSection />
    </div>
  );
}
