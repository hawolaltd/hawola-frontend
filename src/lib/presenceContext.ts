export type PresencePageContext = {
  page_type?: string;
  product?: { id?: number | null; slug?: string | null; name?: string | null };
  store?: { id?: number | null; slug?: string | null; name?: string | null };
};

let current: PresencePageContext = {};

export function setPresenceContext(next: PresencePageContext) {
  current = { ...next };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hawola:presence-context"));
  }
}

export function clearPresenceContext() {
  current = {};
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hawola:presence-context"));
  }
}

export function getPresenceContext(): PresencePageContext {
  return current;
}

const SESSION_KEY = "hawola_presence_session_key";

export function getOrCreatePresenceSessionKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let key = localStorage.getItem(SESSION_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, "")
          : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(SESSION_KEY, key);
    }
    return key;
  } catch {
    return `${Date.now().toString(16)}`;
  }
}
