import Cookies from "js-cookie";
import { API } from "@/constant";
import { authTokenStorageKeyName } from "@/constant";

const RECONNECT_BASE_MS = 3000;
const RECONNECT_MAX_MS = 60000;
export const CHAT_FALLBACK_POLL_MS = 30000;

export type BuyerChatWsMessage = {
  id: number;
  sender_type: string;
  body: string;
  created_at: string;
  sender_user?: number | null;
  is_hidden?: boolean;
};

export function buildBuyerChatWsUrl(
  slug: string,
  token: string,
  apiBase: string = API || "http://localhost:8000/api"
): string {
  const origin = (apiBase || "").replace(/\/api\/?$/, "") || "http://localhost:8000";
  const wsOrigin = origin.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
  const params = new URLSearchParams({ token });
  return `${wsOrigin}/ws/chat/${encodeURIComponent(slug)}/?${params}`;
}

function defaultGetToken(): string | null {
  return Cookies.get(authTokenStorageKeyName as string) || null;
}

export function subscribeBuyerChat(
  slug: string,
  options: {
    apiBase?: string;
    getToken?: () => string | null | Promise<string | null>;
    onMessage?: (message: BuyerChatWsMessage) => void;
    onConnectedChange?: (connected: boolean) => void;
  }
): () => void {
  const {
    apiBase = API || "http://localhost:8000/api",
    getToken = defaultGetToken,
    onMessage,
    onConnectedChange,
  } = options;

  if (!slug) return () => {};

  let ws: WebSocket | null = null;
  let stopped = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let wasConnected = false;
  let reportedDisconnected = false;

  const notifyDisconnected = () => {
    if (reportedDisconnected) return;
    reportedDisconnected = true;
    onConnectedChange?.(false);
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

  const connect = async () => {
    if (stopped) return;

    if (ws) {
      try {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      } catch {
        /* ignore */
      }
      ws = null;
    }

    const token = await Promise.resolve(getToken());
    if (!token) {
      notifyDisconnected();
      scheduleReconnect();
      return;
    }

    const url = buildBuyerChatWsUrl(slug, token, apiBase);
    ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttempt = 0;
      wasConnected = true;
      reportedDisconnected = false;
      onConnectedChange?.(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data?.type === "chat.message" && data.message) {
          onMessage?.(data.message as BuyerChatWsMessage);
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => {
      ws = null;
      if (wasConnected) {
        wasConnected = false;
        notifyDisconnected();
      } else {
        notifyDisconnected();
      }
      if (!stopped) scheduleReconnect();
    };

    ws.onerror = () => {
      ws?.close();
    };
  };

  void connect();

  return () => {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    if (ws) {
      try {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      } catch {
        /* ignore */
      }
    }
    ws = null;
  };
}
