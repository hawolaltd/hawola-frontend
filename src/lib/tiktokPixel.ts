/**
 * TikTok Pixel event helpers — base code loads from _document.tsx <head>.
 * PII is SHA-256 hashed client-side before ttq.identify(), per TikTok spec.
 */

import {
  createTikTokEventId,
  setNextTikTokRequestEventId,
} from "@/lib/tiktokAttribution";
import { TIKTOK_PIXEL_ID } from "@/lib/tiktokPixelHeadScript";

declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string, options?: Record<string, unknown>) => void;
      page: () => void;
      push?: (command: unknown[]) => void;
      ready?: (callback: () => void) => void;
      track: (
        event: string,
        properties?: Record<string, unknown>,
        options?: Record<string, unknown>
      ) => void;
      identify?: (properties: Record<string, unknown>) => void;
    };
  }
}

const PIXEL_ID = TIKTOK_PIXEL_ID;
const CURRENCY = "NGN";

export type TikTokContentItem = {
  content_id: string;
  content_type?: "product" | "product_group";
  content_name?: string;
  quantity?: number;
  price?: number;
};

export type TikTokUserIdentity = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | number | null;
};

type TikTokTrackOptions = {
  eventId?: string;
  attachToNextRequest?: boolean;
  contents?: TikTokContentItem[];
  value?: number;
  currency?: string;
  searchString?: string;
  identity?: TikTokUserIdentity;
};

function whenTtqReady(run: () => void): void {
  if (typeof window === "undefined" || !PIXEL_ID) return;

  const start = Date.now();
  const attempt = () => {
    const ttq = window.ttq;
    if (!ttq) {
      if (Date.now() - start < 10000) {
        window.setTimeout(attempt, 150);
      }
      return;
    }
    if (typeof ttq.ready === "function") {
      ttq.ready(run);
      return;
    }
    if (typeof ttq.track === "function") {
      run();
      return;
    }
    if (Date.now() - start < 10000) {
      window.setTimeout(attempt, 150);
    }
  };
  attempt();
}

async function hashSha256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  if (!normalized || typeof window === "undefined" || !window.crypto?.subtle) {
    return "";
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Call before events when customer PII is available (email / phone / user id). */
export async function identifyTikTokUser(
  identity: TikTokUserIdentity
): Promise<void> {
  if (typeof window === "undefined" || !PIXEL_ID) return;

  const payload: Record<string, string> = {};

  if (identity.email?.trim()) {
    const hashed = await hashSha256(identity.email);
    if (hashed) payload.email = hashed;
  }
  if (identity.phone?.trim()) {
    const hashed = await hashSha256(normalizePhone(identity.phone));
    if (hashed) payload.phone_number = hashed;
  }
  if (identity.externalId != null && String(identity.externalId).trim()) {
    const hashed = await hashSha256(String(identity.externalId));
    if (hashed) payload.external_id = hashed;
  }

  if (Object.keys(payload).length === 0) return;

  whenTtqReady(() => {
    window.ttq?.identify?.(payload);
  });
}

function productUnitPrice(
  price?: number | string | null,
  discountPrice?: number | string | null
): number {
  const value = Number(discountPrice ?? price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function productToTikTokContent(product: {
  id: number | string;
  name?: string;
  price?: number | string | null;
  discount_price?: number | string | null;
  qty?: number;
}): TikTokContentItem {
  const qty = Math.max(1, product.qty || 1);
  const unitPrice = productUnitPrice(product.price, product.discount_price);
  return {
    content_id: String(product.id),
    content_type: "product",
    content_name: product.name || "Product",
    quantity: qty,
    price: unitPrice,
  };
}

function trackTikTokEvent(eventName: string, options: TikTokTrackOptions = {}): string | null {
  if (typeof window === "undefined" || !PIXEL_ID) return null;

  const eventId = options.eventId || createTikTokEventId(eventName.toLowerCase());
  const properties: Record<string, unknown> = { event_id: eventId };

  if (options.contents?.length) properties.contents = options.contents;
  if (typeof options.value === "number") properties.value = options.value;
  properties.currency = options.currency || CURRENCY;
  if (options.searchString) properties.search_string = options.searchString;

  if (options.attachToNextRequest) {
    setNextTikTokRequestEventId(eventId);
  }

  void (async () => {
    if (options.identity) {
      await identifyTikTokUser(options.identity);
    }
    whenTtqReady(() => {
      window.ttq?.track(eventName, properties);
    });
  })();

  return eventId;
}

export function isTikTokPixelEnabled(): boolean {
  return Boolean(PIXEL_ID);
}

export function initTikTokPixel(): void {}

export function trackTikTokViewContent(
  product: {
    id: number | string;
    name?: string;
    price?: number | string | null;
    discount_price?: number | string | null;
  },
  identity?: TikTokUserIdentity
): void {
  const content = productToTikTokContent(product);
  trackTikTokEvent("ViewContent", {
    contents: [content],
    value: content.price,
    identity,
  });
}

export function trackTikTokAddToCart(
  item: {
    id: number | string;
    name?: string;
    price?: number | string | null;
    discount_price?: number | string | null;
    qty?: number;
  },
  identity?: TikTokUserIdentity
): void {
  const content = productToTikTokContent(item);
  const value = (content.price || 0) * (content.quantity || 1);
  trackTikTokEvent("AddToCart", {
    attachToNextRequest: true,
    contents: [content],
    value,
    identity,
  });
}

export function trackTikTokAddToWishlist(
  item: {
    id: number | string;
    name?: string;
    price?: number | string | null;
    discount_price?: number | string | null;
  },
  identity?: TikTokUserIdentity
): void {
  const content = productToTikTokContent(item);
  trackTikTokEvent("AddToWishlist", {
    contents: [content],
    value: content.price,
    identity,
  });
}

export function trackTikTokSearch(
  searchString: string,
  contents: TikTokContentItem[] = [],
  identity?: TikTokUserIdentity
): void {
  const value = contents.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  trackTikTokEvent("Search", {
    searchString: searchString.trim(),
    contents: contents.length ? contents : undefined,
    value: value > 0 ? value : undefined,
    identity,
  });
}

export function trackTikTokInitiateCheckout(payload: {
  value: number;
  contents: TikTokContentItem[];
  identity?: TikTokUserIdentity;
}): void {
  trackTikTokEvent("InitiateCheckout", {
    attachToNextRequest: true,
    contents: payload.contents,
    value: payload.value,
    identity: payload.identity,
  });
}

export function trackTikTokAddPaymentInfo(payload: {
  value: number;
  contents: TikTokContentItem[];
  identity?: TikTokUserIdentity;
}): void {
  trackTikTokEvent("AddPaymentInfo", {
    attachToNextRequest: true,
    contents: payload.contents,
    value: payload.value,
    identity: payload.identity,
  });
}

export function trackTikTokPlaceAnOrder(payload: {
  orderId: string;
  value: number;
  contents: TikTokContentItem[];
  identity?: TikTokUserIdentity;
}): void {
  trackTikTokEvent("PlaceAnOrder", {
    eventId: createTikTokEventId(`order-${payload.orderId}`),
    contents: payload.contents,
    value: payload.value,
    identity: payload.identity,
  });
}

export function trackTikTokPurchase(payload: {
  orderId: string;
  value: number;
  contents: TikTokContentItem[];
  identity?: TikTokUserIdentity;
}): void {
  trackTikTokEvent("Purchase", {
    eventId: createTikTokEventId(`purchase-${payload.orderId}`),
    contents: payload.contents,
    value: payload.value,
    identity: payload.identity,
  });
}

/** @deprecated Prefer trackTikTokPurchase — kept for backward compatibility */
export function trackTikTokCompletePayment(payload: {
  orderId: string;
  value: number;
  contents: TikTokContentItem[];
  email?: string;
  phone?: string;
  externalId?: string | number;
}): void {
  trackTikTokPurchase({
    orderId: payload.orderId,
    value: payload.value,
    contents: payload.contents,
    identity: {
      email: payload.email,
      phone: payload.phone,
      externalId: payload.externalId,
    },
  });
}

export function trackTikTokCompleteRegistration(identity: TikTokUserIdentity): void {
  trackTikTokEvent("CompleteRegistration", {
    attachToNextRequest: true,
    identity,
  });
}

export function buildContentsFromOrderItems(
  orderItems: Array<{
    product?: { id?: number; name?: string; price?: number | string };
    product_id?: number;
    product_name?: string;
    qty?: number;
    order_price?: number | string;
    id?: number;
  }>
): TikTokContentItem[] {
  return orderItems.map((item) =>
    productToTikTokContent({
      id: item.product?.id || item.product_id || item.id || "unknown",
      name: item.product?.name || item.product_name,
      price: item.order_price ?? item.product?.price,
      qty: item.qty,
    })
  );
}

export function tikTokIdentityFromProfile(profile?: {
  email?: string | null;
  phone_number?: string | null;
  pk?: number;
  id?: number;
} | null): TikTokUserIdentity | undefined {
  if (!profile?.email && !profile?.phone_number && !profile?.pk && !profile?.id) {
    return undefined;
  }
  return {
    email: profile.email,
    phone: profile.phone_number,
    externalId: profile.pk ?? profile.id,
  };
}
