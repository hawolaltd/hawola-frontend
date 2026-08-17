import type { StorefrontCouponMeta } from "@/lib/storeCouponDiscount";

const STORAGE_KEY = "hawola_pending_coupon_code";
const META_KEY = "hawola_pending_coupon_meta";

function emit(code: string, meta: StorefrontCouponMeta | null) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("hawola:pending-coupon", {
        detail: { code, meta },
      })
    );
  } catch {
    /* ignore */
  }
}

export function savePendingCouponCode(
  code: string,
  meta?: Partial<StorefrontCouponMeta> | null
) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized || typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
    let payload: StorefrontCouponMeta | null = null;
    if (meta && typeof meta === "object") {
      payload = {
        code: normalized,
        discount_type: String(meta.discount_type || "percent"),
        value: Number(meta.value) || 0,
        scope: String(meta.scope || "all"),
        product_ids: Array.isArray(meta.product_ids)
          ? meta.product_ids.map(Number).filter((n) => Number.isFinite(n))
          : [],
      };
      localStorage.setItem(META_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(META_KEY);
    }
    emit(normalized, payload);
  } catch {
    /* ignore */
  }
}

export function readPendingCouponCode(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(STORAGE_KEY) || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

export function readPendingCouponMeta(): StorefrontCouponMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) {
      const code = readPendingCouponCode();
      return code
        ? {
            code,
            discount_type: "percent",
            value: 0,
            scope: "all",
            product_ids: [],
          }
        : null;
    }
    const parsed = JSON.parse(raw) as StorefrontCouponMeta;
    if (!parsed?.code) return null;
    return {
      code: String(parsed.code).toUpperCase(),
      discount_type: String(parsed.discount_type || "percent"),
      value: Number(parsed.value) || 0,
      scope: String(parsed.scope || "all"),
      product_ids: Array.isArray(parsed.product_ids)
        ? parsed.product_ids.map(Number).filter((n) => Number.isFinite(n))
        : [],
    };
  } catch {
    return null;
  }
}

export function clearPendingCouponCode() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    emit("", null);
  } catch {
    /* ignore */
  }
}

/** Prefer query ?coupon= then localStorage. */
export function resolvePendingCouponCode(
  queryCode?: string | string[] | null
): string {
  const fromQuery = Array.isArray(queryCode) ? queryCode[0] : queryCode;
  const q = (fromQuery || "").trim().toUpperCase();
  if (q) {
    savePendingCouponCode(q);
    return q;
  }
  return readPendingCouponCode();
}
