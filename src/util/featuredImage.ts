/**
 * Featured product image row from API (ProductFeaturedImagesSerializer).
 * List/card UIs: prefer Versatile `image.thumbnail` (then smaller/larger renditions), then `image_url`.
 */
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

/** First usable URL for grids/lists (thumbnails before full CDN `image_url`), or null. */
export function featuredImageCardSrc(
  entry: FeaturedImageCardEntry | null | undefined
): string | null {
  if (!entry) return null;
  if (typeof entry.image === "string") {
    return pickUrl(entry.image) ?? null;
  }
  if (entry.image && typeof entry.image === "object") {
    const img = entry.image as Record<string, unknown>;
    const fromVersatile =
      pickUrl(img.thumbnail) ||
      pickUrl(img.thumbnail_100) ||
      pickUrl(img.full_size);
    if (fromVersatile) return fromVersatile;
  }
  return pickUrl(entry.image_url) ?? null;
}

export function featuredImageCardUrl(
  entry: FeaturedImageCardEntry | null | undefined,
  placeholder = "/placeholder.jpg"
): string {
  return featuredImageCardSrc(entry) ?? placeholder;
}
