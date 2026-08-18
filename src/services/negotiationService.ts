import axiosInstance from "@/libs/api/axiosInstance";
import { getOrCreatePresenceSessionKey } from "@/lib/presenceContext";

export type NegotiationOfferResult = {
  code: string;
  discount_type: string;
  value: string;
  amount_saved: string;
  list_price: string;
  offer_price: string;
  headline: string;
  subline: string;
  product_url: string;
  product_slug: string;
  product_id: number;
  product_name: string;
  tier?: number;
  merchant_id?: number;
  product_ids?: number[];
  session_key?: string;
  is_followup?: boolean;
};

export type NegotiationEventName =
  | "shown"
  | "declined"
  | "applied"
  | "cart_shown"
  | "cart_applied"
  | "cart_dismissed";

export type NegotiationEventChannel = "modal" | "banner" | "cart";

export async function fetchNegotiationOffer(params: {
  product_id?: number;
  product_slug?: string;
  step?: "first" | "followup";
}): Promise<NegotiationOfferResult> {
  const { data } = await axiosInstance.post("engagement/negotiation/offer/", {
    ...params,
    session_key: getOrCreatePresenceSessionKey(),
  });
  return data;
}

export function trackNegotiationEvent(payload: {
  event: NegotiationEventName;
  channel: NegotiationEventChannel;
  product_id?: number;
  coupon_code?: string;
  is_followup?: boolean;
}): void {
  if (typeof window === "undefined") return;
  void axiosInstance
    .post("engagement/negotiation/event/", {
      ...payload,
      session_key: getOrCreatePresenceSessionKey(),
    })
    .catch(() => {
      /* analytics must never block the shopper */
    });
}

const STATE_PREFIX = "hawola_neg_offer_state_";
const LEGACY_DONE_PREFIX = "hawola_neg_offer_done_";
const CART_NUDGE_KEY = "hawola_neg_cart_nudge";

/** Wait at least this long after a decline before a soft reminder. */
export const FOLLOWUP_MIN_MS = 45_000;
export const FOLLOWUP_MAX_MS = 75_000;

export type NegotiationOfferState = {
  status: "none" | "applied" | "declined";
  declineCount: number;
  followupAt: number | null;
};

export type NegotiationCartNudge = {
  product_id: number;
  product_slug: string;
  product_name: string;
  code: string;
  amount_saved: string;
  offer_price: string;
  discount_type: string;
  value: string;
  product_ids: number[];
};

function emptyState(): NegotiationOfferState {
  return { status: "none", declineCount: 0, followupAt: null };
}

export function negotiationOfferStateKey(productId: number): string {
  return `${STATE_PREFIX}${productId}`;
}

export function readNegotiationOfferState(
  productId: number
): NegotiationOfferState {
  if (typeof window === "undefined") {
    return { status: "applied", declineCount: 0, followupAt: null };
  }
  try {
    const raw = sessionStorage.getItem(negotiationOfferStateKey(productId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NegotiationOfferState>;
      return {
        status:
          parsed.status === "applied" || parsed.status === "declined"
            ? parsed.status
            : "none",
        declineCount: Number(parsed.declineCount) || 0,
        followupAt:
          typeof parsed.followupAt === "number" ? parsed.followupAt : null,
      };
    }
    if (sessionStorage.getItem(`${LEGACY_DONE_PREFIX}${productId}`) === "1") {
      return { status: "declined", declineCount: 1, followupAt: null };
    }
  } catch {
    /* ignore */
  }
  return emptyState();
}

function writeNegotiationOfferState(
  productId: number,
  state: NegotiationOfferState
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      negotiationOfferStateKey(productId),
      JSON.stringify(state)
    );
  } catch {
    /* ignore */
  }
}

export function hasAppliedNegotiationOffer(productId: number): boolean {
  return readNegotiationOfferState(productId).status === "applied";
}

/** First full popup is still allowed (not applied, never declined). */
export function canShowFirstNegotiationOffer(productId: number): boolean {
  const state = readNegotiationOfferState(productId);
  return state.status !== "applied" && state.declineCount < 1;
}

export function markNegotiationOfferApplied(productId: number): void {
  writeNegotiationOfferState(productId, {
    status: "applied",
    declineCount: readNegotiationOfferState(productId).declineCount,
    followupAt: null,
  });
  clearNegotiationCartNudge();
}

/**
 * Record a decline. Always schedules one quiet follow-up after the first
 * decline (45–75s). Returns delay in ms, or null if there will be no follow-up.
 */
export function markNegotiationOfferDeclined(
  productId: number
): number | null {
  const prev = readNegotiationOfferState(productId);
  const declineCount = prev.declineCount + 1;
  const allowFollowup = declineCount === 1;
  const delay = allowFollowup
    ? FOLLOWUP_MIN_MS +
      Math.floor(Math.random() * (FOLLOWUP_MAX_MS - FOLLOWUP_MIN_MS))
    : null;
  writeNegotiationOfferState(productId, {
    status: "declined",
    declineCount,
    followupAt: delay != null ? Date.now() + delay : null,
  });
  return delay;
}

export function saveNegotiationCartNudge(
  offer: Pick<
    NegotiationOfferResult,
    | "product_id"
    | "product_slug"
    | "product_name"
    | "code"
    | "amount_saved"
    | "offer_price"
    | "discount_type"
    | "value"
    | "product_ids"
  >
): void {
  if (typeof window === "undefined" || !offer?.code || !offer.product_id) {
    return;
  }
  const nudge: NegotiationCartNudge = {
    product_id: Number(offer.product_id),
    product_slug: String(offer.product_slug || ""),
    product_name: String(offer.product_name || "this item"),
    code: String(offer.code).toUpperCase(),
    amount_saved: String(offer.amount_saved || "0"),
    offer_price: String(offer.offer_price || "0"),
    discount_type: String(offer.discount_type || "fixed"),
    value: String(offer.value || "0"),
    product_ids: Array.isArray(offer.product_ids)
      ? offer.product_ids.map(Number).filter((n) => Number.isFinite(n))
      : [Number(offer.product_id)],
  };
  try {
    sessionStorage.setItem(CART_NUDGE_KEY, JSON.stringify(nudge));
  } catch {
    /* ignore */
  }
}

export function readNegotiationCartNudge(): NegotiationCartNudge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CART_NUDGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NegotiationCartNudge>;
    const productId = Number(parsed.product_id);
    const code = String(parsed.code || "").toUpperCase();
    if (!productId || !code) return null;
    return {
      product_id: productId,
      product_slug: String(parsed.product_slug || ""),
      product_name: String(parsed.product_name || "this item"),
      code,
      amount_saved: String(parsed.amount_saved || "0"),
      offer_price: String(parsed.offer_price || "0"),
      discount_type: String(parsed.discount_type || "fixed"),
      value: String(parsed.value || "0"),
      product_ids: Array.isArray(parsed.product_ids)
        ? parsed.product_ids.map(Number).filter((n) => Number.isFinite(n))
        : [productId],
    };
  } catch {
    return null;
  }
}

export function clearNegotiationCartNudge(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CART_NUDGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearScheduledFollowup(productId: number): void {
  const prev = readNegotiationOfferState(productId);
  writeNegotiationOfferState(productId, { ...prev, followupAt: null });
}

/** @deprecated */
export function hasCompletedNegotiationOffer(productId: number): boolean {
  return !canShowFirstNegotiationOffer(productId);
}

/** @deprecated */
export function markNegotiationOfferCompleted(productId: number): void {
  markNegotiationOfferDeclined(productId);
}

/** @deprecated */
export function hasShownNegotiationOffer(productId: number): boolean {
  return hasCompletedNegotiationOffer(productId);
}

/** @deprecated */
export function markNegotiationOfferShown(productId: number): void {
  markNegotiationOfferCompleted(productId);
}
