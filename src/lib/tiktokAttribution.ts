const TTCLID_STORAGE_KEY = "hawola_tiktok_ttclid";
const TTCLID_COOKIE = "_hawola_ttclid";
const TTCLID_MAX_AGE_SECONDS = 28 * 24 * 60 * 60;

/** Persist TikTok click id from ad landing URLs (`?ttclid=...`). */
export function captureTikTokClickId(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ttclid = params.get("ttclid")?.trim();
  if (!ttclid) return;

  try {
    localStorage.setItem(TTCLID_STORAGE_KEY, ttclid);
  } catch {
    // ignore storage failures
  }
  document.cookie = `${TTCLID_COOKIE}=${encodeURIComponent(ttclid)}; path=/; max-age=${TTCLID_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getStoredTtclid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = localStorage.getItem(TTCLID_STORAGE_KEY)?.trim();
    if (fromStorage) return fromStorage;
  } catch {
    // ignore
  }
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${TTCLID_COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** TikTok first-party cookie set by the pixel SDK. */
export function getTtpCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)_ttp=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function createTikTokEventId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

let nextRequestEventId: string | null = null;

/** Attach event id to the next API request for server-side deduplication. */
export function setNextTikTokRequestEventId(eventId: string): void {
  nextRequestEventId = eventId;
}

export function consumeNextTikTokRequestEventId(): string | null {
  const id = nextRequestEventId;
  nextRequestEventId = null;
  return id;
}
