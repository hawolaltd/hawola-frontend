const SESSION_KEY = "hawola_guest_cart_session";

let memorySession: string | null = null;

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous cart session — memory first (TikTok-safe), then storage. */
export function getGuestCartSessionId(): string {
  if (memorySession) return memorySession;

  if (typeof window !== "undefined") {
    try {
      const fromSession = sessionStorage.getItem(SESSION_KEY);
      if (fromSession) {
        memorySession = fromSession;
        return fromSession;
      }
    } catch {
      /* blocked */
    }
    try {
      const fromLocal = localStorage.getItem(SESSION_KEY);
      if (fromLocal) {
        memorySession = fromLocal;
        return fromLocal;
      }
    } catch {
      /* blocked */
    }
  }

  const id = generateSessionId();
  memorySession = id;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export function clearGuestCartSession(): void {
  memorySession = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasGuestCartSession(): boolean {
  return Boolean(memorySession) || getGuestCartSessionId().length > 0;
}
