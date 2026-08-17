import Cookies from "js-cookie";
import { API, authTokenStorageKeyName } from "@/constant";
import {
  getOrCreatePresenceSessionKey,
  getPresenceContext,
} from "@/lib/presenceContext";

const RECONNECT_BASE_MS = 2500;
const RECONNECT_MAX_MS = 45000;
const HEARTBEAT_MS = 20000;

export type FlashAlertPayload = {
  id?: string;
  template_key?: string;
  header?: string;
  body?: string;
  tone?: string;
  cta_label?: string;
  cta_url?: string;
  coupon_code?: string | null;
  expires_at?: string | null;
  display_style?: "toast" | "promo" | string;
  eyebrow?: string;
  highlight?: string;
  subline?: string;
  detail?: string;
  source?: string;
  allow_opt_out?: boolean;
};

function apiOrigin(): string {
  const apiBase = API || "http://localhost:8000/api";
  return (apiBase || "").replace(/\/api\/?$/, "") || "http://localhost:8000";
}

function buildPresenceWsUrl(sessionKey: string, token: string | null): string {
  const wsOrigin = apiOrigin()
    .replace(/^http:/i, "ws:")
    .replace(/^https:/i, "wss:");
  const params = new URLSearchParams({
    session_key: sessionKey,
    client: "web",
  });
  if (token) params.set("token", token);
  return `${wsOrigin}/ws/presence/?${params}`;
}

function pageTypeFromPath(path: string): string {
  if (!path || path === "/") return "home";
  if (path.startsWith("/product/")) return "product";
  if (path.startsWith("/carts/checkout") || path.startsWith("/checkout"))
    return "checkout";
  if (path.startsWith("/carts")) return "cart";
  if (path.startsWith("/promo/")) return "promo";
  if (path.startsWith("/search")) return "other";
  const parts = path.split("/").filter(Boolean);
  if (
    parts.length === 1 &&
    !["login", "register", "account", "wishlist"].includes(parts[0])
  ) {
    return "store";
  }
  return "other";
}

function heartbeatPayload(path: string) {
  const ctx = getPresenceContext();
  return {
    session_key: getOrCreatePresenceSessionKey(),
    client: "web",
    path,
    page_type: ctx.page_type || pageTypeFromPath(path),
    product: ctx.product || {},
    store: ctx.store || {},
  };
}

async function postHttpHeartbeat(path: string) {
  const apiBase = (API || "http://localhost:8000/api").replace(/\/?$/, "/");
  const token = Cookies.get(authTokenStorageKeyName as string) || null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${apiBase}engagement/heartbeat/`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(heartbeatPayload(path)),
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (data?.session_key) {
      try {
        localStorage.setItem("hawola_presence_session_key", data.session_key);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

export type FlashOutcome = "dismissed" | "timed_out" | "kept" | "cta_clicked";

export async function reportFlashOutcome(
  alertId: string | number | undefined,
  outcome: FlashOutcome
) {
  if (alertId == null || alertId === "") return;
  const apiBase = (API || "http://localhost:8000/api").replace(/\/?$/, "/");
  const body = JSON.stringify({
    alert_id: alertId,
    outcome,
    session_key: getOrCreatePresenceSessionKey(),
  });
  const url = `${apiBase}engagement/flash-ack/`;
  try {
    // No credentials: JWT-cookie CSRF was silently blocking reaction acks.
    // Alert id from the delivered flash is enough to record Keep / Close.
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

export function subscribePresence(options: {
  getPath: () => string;
  onFlash?: (payload: FlashAlertPayload) => void;
}): () => void {
  const { getPath, onFlash } = options;
  let ws: WebSocket | null = null;
  let stopped = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectAttempt = 0;
  let wsOpen = false;

  const clearReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const sendWsHeartbeat = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const path = getPath() || "/";
    ws.send(
      JSON.stringify({
        type: "heartbeat",
        ...heartbeatPayload(path),
      })
    );
  };

  const tickHeartbeat = () => {
    const path = getPath() || "/";
    // Always keep admin list fresh via HTTP (works even if WS is down).
    void postHttpHeartbeat(path);
    if (wsOpen) sendWsHeartbeat();
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS
    );
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, delay);
  };

  const connect = () => {
    if (stopped) return;
    if (ws) {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      ws = null;
    }
    wsOpen = false;
    const sessionKey = getOrCreatePresenceSessionKey();
    const token = Cookies.get(authTokenStorageKeyName as string) || null;
    const url = buildPresenceWsUrl(sessionKey, token);
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      reconnectAttempt = 0;
      wsOpen = true;
      sendWsHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "flash.alert" && data.payload) {
          onFlash?.(data.payload as FlashAlertPayload);
        }
        if (data?.type === "presence.ready" && data.session_key) {
          try {
            localStorage.setItem(
              "hawola_presence_session_key",
              data.session_key
            );
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => {
      wsOpen = false;
      ws = null;
      clearReconnect();
      scheduleReconnect();
    };

    ws.onerror = () => {
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  };

  const onContext = () => tickHeartbeat();
  if (typeof window !== "undefined") {
    window.addEventListener("hawola:presence-context", onContext);
  }

  void connect();
  tickHeartbeat();
  heartbeatTimer = setInterval(tickHeartbeat, HEARTBEAT_MS);

  return () => {
    stopped = true;
    clearReconnect();
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("hawola:presence-context", onContext);
    }
    try {
      ws?.close();
    } catch {
      /* ignore */
    }
    ws = null;
  };
}
