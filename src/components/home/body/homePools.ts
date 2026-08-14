import type { AdvertBanner, ProductFull } from "@/types/home";

export type HomeProductPools = {
  recommended: ProductFull[];
  specials: ProductFull[];
  topRated: ProductFull[];
  bestSelling: ProductFull[];
  topSelling: ProductFull[];
  advertMiddle: (AdvertBanner | null)[];
  advertBottom: (AdvertBanner | null)[];
};

function asProducts(raw: unknown): ProductFull[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean) as ProductFull[];
}

function asAdverts(raw: unknown): (AdvertBanner | null)[] {
  if (!Array.isArray(raw)) return [];
  return raw as (AdvertBanner | null)[];
}

export function getHomeProductPools(homeData: Record<string, unknown> | null | undefined): HomeProductPools {
  const d = homeData ?? {};
  const specialsRaw = d.hawola_specials ?? d.odinwo_specials;
  return {
    recommended: asProducts(d.recommended_products).slice(0, 30),
    specials: asProducts(specialsRaw).slice(0, 24),
    topRated: asProducts(d.top_rated_products).slice(0, 15),
    bestSelling: asProducts(d.best_selling_products).slice(0, 20),
    topSelling: asProducts(d.top_selling_products).slice(0, 20),
    advertMiddle: asAdverts(d.advert_banner_middle),
    advertBottom: asAdverts(d.advert_banner_bottom),
  };
}
