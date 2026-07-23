import { getApiUrl } from "@/lib/config";

export type PromoFunnelEvent = "product_click" | "product_view" | "add_to_cart";

export function promoProductPath(productSlug: string, promoSlug: string): string {
  return `/product/${encodeURIComponent(productSlug)}?from_promo=${encodeURIComponent(promoSlug)}`;
}

export async function trackPromoFunnelEvent(
  promoSlug: string,
  eventType: PromoFunnelEvent,
  productId?: number
): Promise<void> {
  if (!promoSlug || typeof window === "undefined") return;
  try {
    await fetch(
      `${getApiUrl()}/api/products/sales-landing/${encodeURIComponent(promoSlug)}/track/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          ...(productId != null ? { product_id: productId } : {}),
        }),
      }
    );
  } catch {
    /* non-blocking */
  }
}

export function onPromoProductClick(promoSlug: string, productId: number): void {
  void trackPromoFunnelEvent(promoSlug, "product_click", productId);
}

/** Guest cart intent + promo funnel attribution (auth cart uses the cart API). */
export async function trackCartIntent(
  productId: number,
  qty: number,
  promoSlug?: string | null
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(`${getApiUrl()}/api/products/track-cart-intent/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        qty,
        ...(promoSlug ? { promo_slug: promoSlug } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function recordProductDetailView(
  slug: string,
  promoSlug?: string | null
): Promise<void> {
  if (!slug || typeof window === "undefined") return;
  try {
    await fetch(
      `${getApiUrl()}/api/products/detail/${encodeURIComponent(slug)}/record-view/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(promoSlug ? { promo_slug: promoSlug } : {}),
        }),
      }
    );
  } catch {
    /* non-blocking */
  }
}
