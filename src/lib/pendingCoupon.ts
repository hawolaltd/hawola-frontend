const STORAGE_KEY = "hawola_pending_coupon_code";

export function savePendingCouponCode(code: string) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized || typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
    window.dispatchEvent(
      new CustomEvent("hawola:pending-coupon", { detail: { code: normalized } })
    );
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

export function clearPendingCouponCode() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("hawola:pending-coupon", { detail: { code: "" } })
    );
  } catch {
    /* ignore */
  }
}

/** Prefer query ?coupon= then localStorage. */
export function resolvePendingCouponCode(queryCode?: string | string[] | null): string {
  const fromQuery = Array.isArray(queryCode) ? queryCode[0] : queryCode;
  const q = (fromQuery || "").trim().toUpperCase();
  if (q) {
    savePendingCouponCode(q);
    return q;
  }
  return readPendingCouponCode();
}
