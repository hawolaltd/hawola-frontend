/** VersatileImageField / merchant banner image sizes from the API. */
export type MerchantBannerImageSizes = {
  full_size?: string;
  medium_square_crop?: string;
  thumbnail?: string;
  thumbnail_100?: string;
};

export type MerchantBannerSlide = {
  id?: number | string;
  image?: MerchantBannerImageSizes;
  image_url?: string;
};

function pickUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function urlFromVersatileImage(
  image: MerchantBannerImageSizes | string | null | undefined
): string | null {
  if (!image) return null;
  if (typeof image === "string") return pickUrl(image);
  return (
    pickUrl(image.full_size) ||
    pickUrl(image.medium_square_crop) ||
    pickUrl(image.thumbnail) ||
    pickUrl(image.thumbnail_100) ||
    null
  );
}

/**
 * Resolve hero banner image URL from carousel slides or merchant profile default_banner.
 */
export function resolveMerchantBannerUrl(options: {
  banners?: MerchantBannerSlide[] | null;
  defaultBanner?: MerchantBannerImageSizes | string | null;
  merchantBanner?: Array<{ image?: MerchantBannerImageSizes }> | null;
}): string | null {
  const { banners, defaultBanner, merchantBanner } = options;

  if (Array.isArray(banners) && banners.length > 0) {
    for (const slide of banners) {
      const fromBanner =
        pickUrl(slide?.image?.full_size) ||
        pickUrl(slide?.image?.medium_square_crop) ||
        pickUrl(slide?.image?.thumbnail) ||
        pickUrl(slide?.image_url);
      if (fromBanner) return fromBanner;
    }
  }

  const fromDefault = urlFromVersatileImage(defaultBanner ?? null);
  if (fromDefault) return fromDefault;

  if (Array.isArray(merchantBanner) && merchantBanner.length > 0) {
    for (const slide of merchantBanner) {
      const fromMb =
        pickUrl(slide?.image?.full_size) ||
        pickUrl(slide?.image?.medium_square_crop) ||
        pickUrl(slide?.image?.thumbnail);
      if (fromMb) return fromMb;
    }
  }

  return null;
}

/** True when at least one carousel slide has a loadable image URL. */
export function hasUsableBannerSlides(
  banners?: MerchantBannerSlide[] | null
): boolean {
  if (!Array.isArray(banners) || banners.length === 0) return false;
  return banners.some((slide) => {
    const img = slide?.image;
    return (
      pickUrl(img?.full_size) ||
      pickUrl(img?.medium_square_crop) ||
      pickUrl(img?.thumbnail) ||
      pickUrl(slide?.image_url)
    );
  });
}

/** Hero area should show a photo (carousel slides or default_banner). */
export function hasMerchantHeroBanner(options: {
  banners?: MerchantBannerSlide[] | null;
  defaultBanner?: MerchantBannerImageSizes | string | null;
  merchantBanner?: Array<{ image?: MerchantBannerImageSizes }> | null;
}): boolean {
  return resolveMerchantBannerUrl(options) !== null;
}

/**
 * Slides for carousel templates: active banners, else a synthetic slide from default_banner.
 */
export function buildMerchantHeroSlides(options: {
  banners?: MerchantBannerSlide[] | null;
  defaultBanner?: MerchantBannerImageSizes | string | null;
}): MerchantBannerSlide[] {
  const usable = (options.banners ?? []).filter((slide) => {
    const img = slide?.image;
    return (
      pickUrl(img?.full_size) ||
      pickUrl(img?.medium_square_crop) ||
      pickUrl(img?.thumbnail) ||
      pickUrl(slide?.image_url)
    );
  });
  if (usable.length > 0) return usable;

  const defaultUrl = urlFromVersatileImage(options.defaultBanner ?? null);
  if (!defaultUrl) return [];

  if (
    options.defaultBanner &&
    typeof options.defaultBanner === "object" &&
    urlFromVersatileImage(options.defaultBanner)
  ) {
    return [{ id: "default", image: options.defaultBanner }];
  }

  return [{ id: "default", image: { full_size: defaultUrl } }];
}
