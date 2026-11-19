import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import LivePlayer from "@/components/live/LivePlayer";
import {
  buildLiveWsUrl,
  liveByStore,
  liveLikes,
  postLiveChat,
  postLiveLike,
  type LiveMessage,
  type LiveSession,
} from "@/lib/hawolaLive";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { addToCarts } from "@/redux/product/productSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { API, authTokenStorageKeyName } from "@/constant";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function HawolaLivePage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const token = Cookies.get(authTokenStorageKeyName as string) || null;
  const [session, setSession] = useState<LiveSession | null>(null);
  const [live, setLive] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    liveByStore(slug)
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
  }, [slug]);

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
  }, [session?.id, session?.status, token]);

  const products = session?.products || [];

  const send = async () => {
    if (!session || !draft.trim()) return;
    if (!isAuthenticated || !token) {
      toast.error("Sign in to chat in this live sale.");
      router.push("/auth/login");
      return;
    }
    try {
      const data = await postLiveChat(session.id, draft.trim(), token);
      if (data.message) setMessages((prev) => [...prev, data.message]);
      setDraft("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    }
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

  const buy = async (productId: number) => {
    try {
      await dispatch(addToCarts({ items: [{ qty: 1, product: productId }] }) as never);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart.");
    }
  };

  const useCoupon = (code: string) => {
    savePendingCouponCode(code, { code });
    toast.success(`Saved ${code} for checkout`);
  };

  const title = useMemo(
    () => session?.title || session?.merchant?.store_name || "Live sale",
    [session]
  );

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading live sale…</p>
        ) : !live || !session ? (
          <div className="rounded-3xl border border-slate-200 p-8 text-center">
            <h1 className="text-2xl font-black">This store is not live right now</h1>
            <p className="mt-2 text-sm text-slate-600">Check the store for products still on sale.</p>
            {slug ? (
              <Link href={`/${slug}`} className="mt-4 inline-block font-semibold text-brand-600">
                Open store
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-black uppercase text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
                <h1 className="text-2xl font-black text-slate-900">{title}</h1>
                <span className="text-sm text-slate-500">{session.viewer_count} watching</span>
              </div>
              <LivePlayer embedUrl={session.embed_url} title={title} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void like()}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    liked ? "bg-red-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  Like · {likes}
                </button>
                {session.promo?.slug ? (
                  <Link
                    href={`/deal/${session.promo.slug}`}
                    className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-950"
                  >
                    Open promo page
                  </Link>
                ) : null}
                <Link href={`/${session.merchant.slug}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold">
                  Visit store
                </Link>
              </div>
              {products.length ? (
                <div className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Selling now</h2>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                    {products.map((p) => (
                      <div key={p.id} className="w-40 shrink-0 rounded-2xl border border-slate-200 p-2">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-28 w-full rounded-xl object-cover" />
                        ) : null}
                        <p className="mt-2 line-clamp-2 text-sm font-semibold">{p.name}</p>
                        <p className="text-sm font-black">₦{Number(p.effective_price || 0).toLocaleString()}</p>
                        <button
                          type="button"
                          className="mt-2 w-full rounded-full bg-slate-900 py-1.5 text-xs font-bold text-white"
                          onClick={() => void buy(p.id)}
                        >
                          Add to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <aside className="flex h-[70vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="border-b px-4 py-3 text-sm font-bold">Live chat</div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <span className="font-semibold text-slate-700">{m.sender_name || "Shopper"}: </span>
                    <span>{m.body}</span>
                    {m.kind === "coupon" && (m.payload as { coupon?: { code?: string } })?.coupon?.code ? (
                      <button
                        type="button"
                        className="ml-2 text-xs font-bold text-brand-600"
                        onClick={() =>
                          useCoupon(String((m.payload as { coupon?: { code?: string } }).coupon?.code))
                        }
                      >
                        Use coupon
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t bg-white p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void send()}
                  placeholder={isAuthenticated ? "Say something…" : "Sign in to chat"}
                  className="flex-1 rounded-full border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  className="rounded-full bg-red-600 px-4 text-sm font-bold text-white"
                >
                  Send
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
