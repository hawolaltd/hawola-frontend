import { API } from "@/constant";

const root = (API || "http://localhost:8000/api").replace(/\/+$/, "");

export type LiveProduct = {
  id: number;
  name: string;
  slug: string;
  price?: string | null;
  discount_price?: string | null;
  effective_price?: string | null;
  image?: string;
  description?: string;
};

export type LiveCoupon = {
  id: number;
  code: string;
  name?: string;
  discount_type?: string;
  value?: string | null;
};

export type LiveMerchant = {
  id: number;
  store_name: string;
  slug: string;
  logo?: string;
  primary_color?: string;
};

export type LiveMessage = {
  id: number;
  sender_type: string;
  kind: string;
  body: string;
  payload?: Record<string, unknown>;
  sender_name?: string;
  sender_user_id?: number | null;
  created_at?: string | null;
};

export type LiveSession = {
  id: number;
  title: string;
  status: string;
  youtube_url: string;
  video_id: string;
  embed_url: string;
  viewer_count: number;
  featured_on_home?: boolean;
  started_at?: string | null;
  merchant: LiveMerchant;
  products: LiveProduct[];
  promo?: LivePromo | null;
  messages?: LiveMessage[];
};

export type LivePromo = {
  id: number;
  title: string;
  slug: string;
  template: string;
  expires_at: string | null;
  is_open: boolean;
  expired?: boolean;
  products: LiveProduct[];
  coupons: LiveCoupon[];
  store: LiveMerchant;
  session_id?: number | null;
};

async function getJson(path: string, token?: string | null) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${root}${path}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Could not load this live sale.");
  }
  return data;
}

async function postJson(path: string, body: unknown, token?: string | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${root}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Could not send.");
  }
  return data;
}

export function liveHome(preview = false, token?: string | null) {
  const q = preview ? "?preview=1" : "";
  return getJson(`/livesales/home/${q}`, token) as Promise<{
    visible: boolean;
    mode: string;
    results: LiveSession[];
  }>;
}

export function liveByStore(slug: string) {
  return getJson(`/livesales/by-store/${encodeURIComponent(slug)}/`) as Promise<{
    live: boolean;
    session: LiveSession | null;
  }>;
}

export function liveDeal(slug: string) {
  return getJson(`/livesales/deals/${encodeURIComponent(slug)}/`) as Promise<LivePromo>;
}

export function liveChatHistory(sessionId: number) {
  return getJson(`/livesales/sessions/${sessionId}/chat/`) as Promise<{ results: LiveMessage[] }>;
}

export function postLiveChat(sessionId: number, body: string, token: string) {
  return postJson(`/livesales/sessions/${sessionId}/chat/`, { body }, token);
}

export function postLiveLike(sessionId: number, token: string) {
  return postJson(`/livesales/sessions/${sessionId}/react/`, { emoji: "like" }, token);
}

export function liveLikes(sessionId: number, token?: string | null) {
  return getJson(`/livesales/sessions/${sessionId}/likes/`, token) as Promise<{
    count: number;
    liked: boolean;
  }>;
}

export function buildLiveWsUrl(sessionId: number, token: string | null, apiBase = root) {
  const origin = (apiBase || "").replace(/\/api\/?$/, "") || "http://localhost:8000";
  const wsOrigin = origin.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  const q = params.toString();
  return `${wsOrigin}/ws/live/${sessionId}/${q ? `?${q}` : ""}`;
}
