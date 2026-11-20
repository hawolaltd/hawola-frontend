import LiveSaleStudio from "@/components/live/LiveSaleStudio";
import LiveGlasshouseStudio from "@/components/live/LiveGlasshouseStudio";
import Header from "@/components/header";
import {
  buildLiveWsUrl,
  liveByStore,
  liveLikes,
  postLiveChat,
  postLiveLike,
  postLiveOffer,
  type LiveMessage,
  type LiveOffer,
  type LiveSession,
  type LiveSticker,
} from "@/lib/hawolaLive";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { useAppSelector } from "@/hook/useReduxTypes";
import { API, authTokenStorageKeyName } from "@/constant";
import Cookies from "js-cookie";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { liveThemeStyle, useLiveTheme } from "@/lib/liveTheme";

export default function HawolaLiveWatch({
  slug,
  shareKey,
}: {
  slug: string;
  shareKey?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, profile, user } = useAppSelector((s) => s.auth);
  const shopperId = Number((profile as { id?: number } | null)?.id || (user as { id?: number } | null)?.id || 0) || null;
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [live, setLive] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDark } = useLiveTheme();

  useEffect(() => {
    setToken(Cookies.get(authTokenStorageKeyName as string) || null);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    liveByStore(slug, shareKey, token)
      .then((data) => {
        if (cancelled) return;
        setLive(Boolean(data.live));
        setSession(data.session);
        setMessages(data.session?.messages || []);
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, shareKey, token]);

  useEffect(() => {
    if (!session?.id) return;
    liveLikes(session.id, token)
      .then((data) => {
        setLikes(data.count || 0);
        setLiked(Boolean(data.liked));
      })
      .catch(() => undefined);
  }, [session?.id, token]);

  useEffect(() => {
    if (!session?.id || session.status !== "live") return;
    const url = buildLiveWsUrl(session.id, token, API || undefined);
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(url);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "chat" && payload.message) {
            setMessages((prev) => [...prev, payload.message]);
          }
          if (payload.type === "viewer_hello" && payload.viewer_count != null) {
            setSession((prev) =>
              prev ? { ...prev, viewer_count: payload.viewer_count } : prev
            );
          }
          if (payload.type === "reaction" && payload.emoji === "like") {
            setLikes(payload.count || 0);
          }
          if (payload.type === "pinned_message") {
            setSession((prev) =>
              prev ? { ...prev, pinned_message: payload.message || null } : prev
            );
          }
          if (payload.type === "products" && Array.isArray(payload.products)) {
            setSession((prev) => (prev ? { ...prev, products: payload.products } : prev));
          }
          if (payload.type === "offers_enabled") {
            setSession((prev) =>
              prev ? { ...prev, offers_enabled: Boolean(payload.offers_enabled) } : prev
            );
          }
          if (payload.type === "live_offer" && payload.offer) {
            const offer = payload.offer as LiveOffer;
            setSession((prev) => {
              if (!prev) return prev;
              const mine = [...(prev.my_offers || [])];
              const idx = mine.findIndex((row) => row.id === offer.id);
              if (offer.buyer_user_id && shopperId && offer.buyer_user_id === shopperId) {
                if (idx >= 0) mine[idx] = offer;
                else mine.unshift(offer);
                if (offer.status === "accepted" && offer.coupon?.code) {
                  savePendingCouponCode(offer.coupon.code, {
                    code: offer.coupon.code,
                    discount_type: offer.coupon.discount_type,
                    value: Number(offer.coupon.value || 0),
                    scope: "products",
                    product_ids: [offer.product_id],
                  });
                }
              }
              return { ...prev, my_offers: mine };
            });
          }
          if (payload.type === "watch_template" && payload.watch_template) {
            setSession((prev) =>
              prev ? { ...prev, watch_template: String(payload.watch_template) } : prev
            );
          }
          if (payload.type === "session_ended") {
            setLive(false);
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      /* ignore */
    }
    return () => {
      socket?.close();
    };
  }, [session?.id, session?.status, token, shopperId]);

  const send = async (text?: string, extra: Record<string, unknown> = {}) => {
    const body = (text ?? draft).trim();
    if (!session || (!body && !extra.sticker && !extra.kind)) return;
    if (!isAuthenticated || !token) {
      toast.error("Sign in to chat in this live sale.");
      router.push("/auth/login");
      return;
    }
    try {
      const data = await postLiveChat(session.id, body, token, extra);
      if (data.message) setMessages((prev) => [...prev, data.message]);
      if (!extra.sticker) setDraft("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    }
  };

  const sendSticker = (sticker: LiveSticker) => {
    void send(`${sticker.emoji} ${sticker.label}`, {
      kind: "reaction",
      sticker: sticker.id,
      emoji: sticker.emoji,
    });
  };

  const like = async () => {
    if (!session) return;
    if (!isAuthenticated || !token) {
      toast.error("Sign in to like this live.");
      return;
    }
    try {
      const data = await postLiveLike(session.id, token);
      setLiked(Boolean(data.liked));
      setLikes(data.count || 0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not like.");
    }
  };

  const useCoupon = (code: string) => {
    savePendingCouponCode(code, { code });
    toast.success(`Saved ${code} for checkout`);
  };

  const sendOffer = async (productId: number, amount: number) => {
    if (!session || !token) {
      toast.error("Sign in to send an offer.");
      router.push("/auth/login");
      return null;
    }
    try {
      const data = await postLiveOffer(session.id, productId, amount, token);
      if (data.offer) {
        setSession((prev) => {
          if (!prev) return prev;
          const mine = [...(prev.my_offers || [])];
          const idx = mine.findIndex((row) => row.id === data.offer.id);
          if (idx >= 0) mine[idx] = data.offer;
          else mine.unshift(data.offer);
          return { ...prev, my_offers: mine };
        });
        toast.success("Offer sent. Waiting for the store.");
      }
      return data.offer;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send offer.");
      return null;
    }
  };

  const pageTitle = useMemo(
    () => session?.title || session?.merchant?.store_name || "Live sale",
    [session]
  );

  return (
    <div
      style={liveThemeStyle(isDark)}
      className="flex h-svh flex-col overflow-hidden bg-[var(--lv-bg)] text-[var(--lv-fg)]"
    >
      <Head>
        <title>{pageTitle} | Hawola Live</title>
      </Head>
      <Header compact />
      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-sm text-[var(--lv-muted)]">
          Opening the live room…
        </div>
      ) : !live || !session ? (
        <div className="mx-auto min-h-0 w-full max-w-screen-xl flex-1 overflow-y-auto px-6 py-10 xl:px-0">
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-[color:var(--lv-border)] bg-[var(--lv-card)] px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
              Hawola Live
            </p>
            <h1 className="mt-3 text-3xl font-black text-[var(--lv-fg)]">This live is not on right now</h1>
            <p className="mt-2 max-w-md text-sm text-[var(--lv-muted)]">
              The stream has ended. You can still shop the store.
            </p>
            {slug ? (
              <Link
                href={`/${slug}`}
                className="mt-6 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Open store
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          {session.watch_template === "glasshouse" ? (
            <LiveGlasshouseStudio
              session={session}
              messages={messages}
              draft={draft}
              likes={likes}
              liked={liked}
              isAuthenticated={isAuthenticated}
              onDraftChange={setDraft}
              onSend={() => void send()}
              onChat={(text) => send(text)}
              onSticker={sendSticker}
              onLike={() => void like()}
              onCoupon={useCoupon}
              onOffer={sendOffer}
              userEmail={profile?.email}
              userPhone={(profile as { phone_number?: string } | null)?.phone_number}
            />
          ) : (
            <LiveSaleStudio
              session={session}
              messages={messages}
              draft={draft}
              likes={likes}
              liked={liked}
              isAuthenticated={isAuthenticated}
              onDraftChange={setDraft}
              onSend={() => void send()}
              onChat={(text) => send(text)}
              onSticker={sendSticker}
              onLike={() => void like()}
              onCoupon={useCoupon}
              onOffer={sendOffer}
              userEmail={profile?.email}
              userPhone={(profile as { phone_number?: string } | null)?.phone_number}
            />
          )}
        </div>
      )}
    </div>
  );
}
