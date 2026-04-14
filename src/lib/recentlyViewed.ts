export type RecentlyViewedSnapshot = {
  id: number;
  slug: string;
  name: string;
  price?: string | number | null;
  discount_price?: string | number | null;
  image_url?: string | null;
};

const LS_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 20;

export function getLocalRecentlyViewedProducts(): RecentlyViewedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && Number.isInteger(Number(item.id))).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function saveLocalRecentlyViewedProduct(snapshot: RecentlyViewedSnapshot) {
  if (typeof window === "undefined") return;
  if (!snapshot?.id || !snapshot?.slug) return;
  const current = getLocalRecentlyViewedProducts().filter((item) => Number(item.id) !== Number(snapshot.id));
  current.unshift(snapshot);
  localStorage.setItem(LS_KEY, JSON.stringify(current.slice(0, MAX_ITEMS)));
  window.dispatchEvent(new Event("hawola:recently-viewed-updated"));
}

export function getLocalRecentlyViewedProductIds(limit = 20): number[] {
  return getLocalRecentlyViewedProducts()
    .map((item) => Number(item.id))
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, limit);
}

export function clearLocalRecentlyViewedProducts() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
  window.dispatchEvent(new Event("hawola:recently-viewed-updated"));
}
