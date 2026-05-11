/**
 * Single-segment paths that resolve to fixed app routes and must never be handled as merchant slugs at `/{slug}`.
 */
const RESERVED_MERCHANT_STORE_SLUGS = new Set([
  "_next",
  "api",
  "auth",
  "account",
  "carts",
  "categories",
  "compare",
  "customer-service",
  "deals-today",
  "disputes",
  "home-modern",
  "inventory",
  "looking-for-product",
  "memory-bank",
  "merchants",
  "order",
  "pickup-locations",
  "product",
  "real-estate",
  "recommended-today",
  "search",
  "wishlist",
  "cars",
  "404",
]);

/**
 * True if this slug cannot be a public merchant storefront URL (would shadow a real route or Next internals).
 */
export function isReservedMerchantStoreSlug(slug: string): boolean {
  const s = decodeURIComponent(slug).trim().toLowerCase();
  if (!s) return true;
  if (s.includes("/")) return true;
  if (s.endsWith(".json") || s.endsWith(".xml") || s.endsWith(".txt")) return true;
  return RESERVED_MERCHANT_STORE_SLUGS.has(s);
}

/** Canonical path-only URL for the public merchant storefront: `/${slug}`. */
export function merchantStorePublicPath(slug: string): string {
  const s = typeof slug === "string" ? slug.trim() : "";
  if (!s) return "";
  return `/${encodeURIComponent(s)}`;
}
