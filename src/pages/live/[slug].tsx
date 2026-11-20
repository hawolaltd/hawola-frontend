import LiveSaleStudio from "@/components/live/LiveSaleStudio";
import Header from "@/components/header";
import Footer from "@/components/home/Footer";
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
import { useAppSelector } from "@/hook/useReduxTypes";
import { API, authTokenStorageKeyName } from "@/constant";
import Cookies from "js-cookie";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function HawolaLivePage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const { isAuthenticated, profile } = useAppSelector((s) => s.auth);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [live, setLive] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(Cookies.get(authTokenStorageKeyName as string) || null);
  }, []);

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

  const useCoupon = (code: string) => {
    savePendingCouponCode(code, { code });
    toast.success(`Saved ${code} for checkout`);
  };

  const pageTitle = useMemo(
    () => session?.title || session?.merchant?.store_name || "Live sale",
    [session]
  );

  return (
    <div className="bg-slate-50">
      <Head>
        <title>{pageTitle} | Hawola Live</title>
      </Head>
      <Header />
      {loading ? (
        <div className="mx-auto flex min-h-[50vh] w-full max-w-screen-xl items-center justify-center px-6 py-16 text-sm text-slate-500 xl:px-0">
          Opening the live room…
        </div>
      ) : !live || !session ? (
        <div className="mx-auto w-full max-w-screen-xl px-6 py-10 xl:px-0">
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-600">
              Hawola Live
            </p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">This store is not live right now</h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
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
        <LiveSaleStudio
          session={session}
          messages={messages}
          draft={draft}
          likes={likes}
          liked={liked}
          isAuthenticated={isAuthenticated}
          onDraftChange={setDraft}
          onSend={() => void send()}
          onLike={() => void like()}
          onCoupon={useCoupon}
          userEmail={profile?.email}
          userPhone={(profile as { phone_number?: string } | null)?.phone_number}
        />
      )}
      <Footer />
    </div>
  );
}
