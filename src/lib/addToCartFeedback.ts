import { isLikelyRestrictedWebView } from "@/lib/inAppBrowser";

export function addToCartErrorMessage(
  payload: unknown,
  fallback = "Could not add to cart."
): string {
  const base =
    typeof payload === "string"
      ? payload
      : payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message || fallback)
        : fallback;

  if (isLikelyRestrictedWebView()) {
    return `${base} Try opening this page in Safari or Chrome (TikTok browser can block checkout).`;
  }
  return base;
}

export function guestCartPersistenceWarning(persisted: boolean): string | null {
  if (persisted) return null;
  if (isLikelyRestrictedWebView()) {
    return "Added for this visit. Open in Safari/Chrome to save your cart and checkout.";
  }
  return "Added for this visit — cart could not be saved on this device.";
}
