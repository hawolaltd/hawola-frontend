/** Customer-facing Hawola storefront (hawola.com). */
export function getStorefrontOrigin(): string {
  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : undefined;
  return (fromEnv || "https://hawola.com").replace(/\/+$/, "");
}

export function storefrontProductPath(productSlug?: string | null): string | null {
  const slug = typeof productSlug === "string" ? productSlug.trim() : "";
  if (!slug) return null;
  return `/product/${encodeURIComponent(slug)}`;
}

export function storefrontMerchantPath(merchantSlug?: string | null): string | null {
  const slug = typeof merchantSlug === "string" ? merchantSlug.trim() : "";
  if (!slug) return null;
  return `/${encodeURIComponent(slug)}`;
}

export function storefrontOrderPath(orderitemNumber?: string | null): string | null {
  const id = typeof orderitemNumber === "string" ? orderitemNumber.trim() : "";
  if (!id) return null;
  return `/order/details/${encodeURIComponent(id)}`;
}
