/**
 * Featured product image row from API (ProductFeaturedImagesSerializer).
 * List/card UIs: prefer Versatile `image.thumbnail` (then smaller/larger renditions), then `image_url`.
 */
import { normalizeMediaSrc } from "@/components/common/OptimizedImage";

export const PRODUCT_IMAGE_PLACEHOLDER = "/imgs/template/monitor.svg";

export type FeaturedImageCardEntry = {
  image_url?: string | null;
  /** VersatileImage dict (`thumbnail`, `full_size`, …), plain URL string, or null. */
  image?: unknown;
};

function pickUrl(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s || undefined;
}

function resolveEntryUrl(entry: FeaturedImageCardEntry): string | null {
  if (typeof entry.image === "string") {
    const direct = pickUrl(entry.image);
    return direct ? normalizeMediaSrc(direct) || direct : null;
  }
  if (entry.image && typeof entry.image === "object") {
    const img = entry.image as Record<string, unknown>;
    const fromVersatile =
      pickUrl(img.thumbnail) ||
      pickUrl(img.thumbnail_100) ||
      pickUrl(img.full_size);
    if (fromVersatile) return normalizeMediaSrc(fromVersatile) || fromVersatile;
  }
  const fromField = pickUrl(entry.image_url);
  return fromField ? normalizeMediaSrc(fromField) || fromField : null;
}

/** First usable URL for grids/lists (thumbnails before full CDN `image_url`), or null. */
export function featuredImageCardSrc(
  entry: FeaturedImageCardEntry | null | undefined
): string | null {
  if (!entry) return null;
  return resolveEntryUrl(entry);
}

export function featuredImageCardUrl(
  entry: FeaturedImageCardEntry | null | undefined,
  placeholder = PRODUCT_IMAGE_PLACEHOLDER
): string {
  return featuredImageCardSrc(entry) ?? placeholder;
}
