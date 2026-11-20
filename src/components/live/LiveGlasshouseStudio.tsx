import LiveEmojiRain from "@/components/live/LiveEmojiRain";
import LiveDealCountdown from "@/components/live/LiveDealCountdown";
import InstantOrderModal from "@/components/product/InstantOrderModal";
import { liveDealActive, liveProductCta, liveSellingPrice, useLiveDealClock } from "@/lib/liveDeal";
import { liveDealPath, type LiveMessage, type LiveOffer, type LiveProduct, type LiveSession, type LiveSticker } from "@/lib/hawolaLive";
import { LIVE_STICKERS } from "@/lib/liveStickers";
import type { OrderDetailsResponse } from "@/types/product";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function glassEmbed(embedUrl: string) {
  if (!embedUrl) return "";
  try {
    const u = new URL(embedUrl);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("mute", "1");
    u.searchParams.set("playsinline", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("enablejsapi", "1");
    u.searchParams.set("modestbranding", "1");
    return u.toString();
  } catch {
    return embedUrl;
  }
}

export default function LiveGlasshouseStudio({
  session,
  messages,
  draft,
  likes,
  liked,
  isAuthenticated,
  onDraftChange,
  onSend,
  onChat,
  onSticker,
  onLike,
  onCoupon,
  onOffer,
  userEmail,
  userPhone,
}: {
  session: LiveSession;
  messages: LiveMessage[];
  draft: string;
  likes: number;
  liked: boolean;
  isAuthenticated: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onChat?: (text: string) => Promise<void> | void;
  onSticker: (sticker: LiveSticker) => void;
  onLike: () => void;
  onCoupon: (code: string) => void;
  onOffer?: (productId: number, amount: number) => Promise<LiveOffer | null>;
  userEmail?: string | null;
  userPhone?: string | null;
}) {
  const chatBox = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [featuredId, setFeaturedId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerBusy, setOfferBusy] = useState(false);
  const [mode, setMode] = useState<"buy" | "offer">("buy");
  const [muted, setMuted] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [likePing, setLikePing] = useState<{ id: number; emoji: string } | null>(null);
  const products = session.products || [];
  const dealNow = useLiveDealClock(products);
  const stickers = session.stickers?.length ? session.stickers : LIVE_STICKERS;
  const store = session.merchant;
  const offersOn = Boolean(session.offers_enabled);
  const myOffers = session.my_offers || [];
  const featured = useMemo(() => {
    if (!products.length) return null;
    return products.find((p) => p.id === featuredId) || products[0];
  }, [products, featuredId]);
  const myOffer = useMemo(() => {
    if (!featured) return null;
    return myOffers.find((row) => row.product_id === featured.id) || null;
  }, [featured, myOffers]);
  const price = featured ? Number(liveSellingPrice(featured, dealNow) || 0) : 0;
  const embed = glassEmbed(session.embed_url || "");

  useEffect(() => {
    const box = chatBox.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (mode === "offer" && featured && !offerAmount) {
      setOfferAmount(String(Math.max(100, Math.round((price * 0.8) / 500) * 500)));
    }
  }, [mode, featured?.id, offerAmount, price]);

  const ytCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  };

  const toggleMute = () => {
    const next = !muted;
    ytCommand(next ? "mute" : "unMute");
    setMuted(next);
  };

  const sendOffer = async () => {
    if (!featured || !onOffer) return;
    const amount = Number(offerAmount);
    if (!amount) {
      toast.error("Enter your offer.");
      return;
    }
    setOfferBusy(true);
    try {
      await onOffer(featured.id, amount);
      setOfferAmount("");
    } finally {
      setOfferBusy(false);
    }
  };

  const bump = (dir: number) => {
    const base = Number(offerAmount) || Math.round(price * 0.8);
    setOfferAmount(String(Math.max(0, base + dir * 500)));
  };

  return (
    <div className="gh relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-[#eef2f1] text-[#0f1f1d] lg:overflow-hidden lg:block">
      <style>{`
        .gh {
          font-family: "Plus Jakarta Sans", system-ui, sans-serif;
        }
        .gh-glass {
          background: rgba(255, 255, 255, 0.78);
          -webkit-backdrop-filter: blur(22px) saturate(1.4);
          backdrop-filter: blur(22px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 40px rgba(15, 31, 29, 0.14);
        }
        .gh-thin::-webkit-scrollbar {
          width: 5px;
        }
        .gh-thin::-webkit-scrollbar-thumb {
          background: rgba(15, 31, 29, 0.18);
          border-radius: 9px;
        }
        @media (min-width: 1024px) {
          .gh-video {
            position: absolute;
            inset: 0;
            overflow: hidden;
            background: #0f1f1d;
          }
          .gh-yt {
            position: absolute;
            top: 50%;
            left: 50%;
            width: max(100vw, 177.78vh);
            height: max(100vh, 56.25vw);
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;800&display=swap"
      />

      <div className="gh-video relative aspect-video shrink-0 bg-black lg:aspect-auto">
        {embed ? (
          <iframe
            ref={iframeRef}
            title={session.title || "Live stream"}
            src={embed}
            className="gh-yt absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/60">Waiting for the stream</div>
        )}
        <LiveEmojiRain messages={messages} ping={likePing} />
      </div>

      <header className="z-10 flex items-center justify-between gap-2 p-3 lg:absolute lg:inset-x-4 lg:top-3 lg:p-0">
        <div className="gh-glass flex items-center gap-3 rounded-full py-2 pl-4 pr-3">
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : null}
          <span className="font-extrabold tracking-tight">
            {(store.store_name || "Hawola").slice(0, 18)}
            <span className="text-teal-600"> Live</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={toggleMute} className="gh-glass rounded-full px-4 py-2 text-sm font-semibold">
            {muted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <div className="gh-glass rounded-full px-4 py-2 text-sm font-semibold">
            👁 {(session.viewer_count || 0).toLocaleString()}
          </div>
          <button
            type="button"
            onClick={() => {
              setLikePing({ id: Date.now(), emoji: "❤️" });
              onLike();
            }}
            className={`gh-glass rounded-full px-4 py-2 text-sm font-semibold ${liked ? "text-rose-600" : ""}`}
          >
            ♥ {likes}
          </button>
        </div>
      </header>

      <aside className="gh-glass z-10 order-3 mx-3 my-2 flex h-[320px] flex-col rounded-3xl lg:absolute lg:bottom-32 lg:left-4 lg:top-16 lg:mx-0 lg:my-0 lg:h-auto lg:w-72">
        <div className="flex shrink-0 items-baseline justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-extrabold">Shop the stream</h2>
          <span className="text-xs font-semibold text-teal-700">{products.length} on air</span>
        </div>
        <div className="gh-thin min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
          {products.length === 0 ? (
            <p className="px-2 py-6 text-xs text-slate-500">Pins land here as the store sells.</p>
          ) : (
            products.map((p) => {
              const on = featured?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFeaturedId(p.id)}
                  className={`w-full overflow-hidden rounded-2xl bg-white text-left transition ${
                    on ? "ring-2 ring-teal-600" : "hover:shadow-md"
                  }`}
                >
                  <div className="relative h-24 bg-slate-100">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        on ? "bg-rose-500 text-white" : "bg-white/90 text-slate-700"
                      }`}
                    >
                      {on ? "● ON AIR" : liveDealActive(p, dealNow) ? "DEAL" : "PIN"}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-bold">{p.name}</div>
                    <div className="mt-0.5 flex justify-between text-xs">
                      <span className="font-bold text-teal-700">{naira(liveSellingPrice(p, dealNow))}</span>
                      {liveDealActive(p, dealNow) ? (
                        <LiveDealCountdown product={p} className="font-mono text-slate-500" />
                      ) : (
                        <span className="text-slate-400">{liveProductCta(p)}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <aside className="gh-glass z-10 order-4 mx-3 my-2 flex h-[380px] flex-col rounded-3xl lg:absolute lg:bottom-32 lg:right-4 lg:top-16 lg:mx-0 lg:my-0 lg:h-auto lg:w-80">
        <div className="shrink-0 px-5 pb-2 pt-4 text-lg font-extrabold">Live chat</div>
        {session.promo?.slug && session.promo.is_open !== false && !session.promo.expired ? (
          <a
            href={liveDealPath(session.merchant?.slug, session.promo.slug) || "#"}
            className="mx-3 mb-2 rounded-2xl bg-teal-600/10 px-3 py-2 text-xs font-semibold text-teal-900"
          >
            Tonight’s deals → {session.promo.title || "Open deal page"}
          </a>
        ) : null}
        <div ref={chatBox} className="gh-thin min-h-0 flex-1 space-y-2 overflow-y-auto px-4 text-sm">
          {messages.length === 0 ? (
            <p className="pt-4 text-center text-slate-500">The room is quiet. Say hello.</p>
          ) : null}
          {messages.map((m) => {
            const merchant = m.sender_type === "merchant" || m.sender_type === "system";
            const isOrder = m.kind === "order";
            const code = (m.payload as { coupon?: { code?: string } })?.coupon?.code;
            return (
              <div key={m.id} className={`flex ${merchant && !isOrder ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    isOrder
                      ? "w-full bg-teal-600/10 text-teal-900"
                      : merchant
                        ? "bg-teal-600 text-white"
                        : "bg-white"
                  }`}
                >
                  <p className="text-[11px] font-bold opacity-70">{m.sender_name || "Shopper"}</p>
                  <p className="break-words">
                    {m.body.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                      /^https?:\/\//.test(part) ? (
                        <a key={`${m.id}-${i}`} href={part} className="underline" target="_blank" rel="noreferrer">
                          {part}
                        </a>
                      ) : (
                        <span key={`${m.id}-${i}`}>{part}</span>
                      )
                    )}
                  </p>
                  {m.kind === "coupon" && code ? (
                    <button type="button" className="mt-1 text-xs font-extrabold" onClick={() => onCoupon(String(code))}>
                      Use {code}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="shrink-0 space-y-2 p-3">
          <div className="flex flex-wrap justify-between gap-1">
            {stickers.slice(0, 6).map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => onSticker(sticker)}
                className="text-2xl hover:scale-125"
                title={sticker.label}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-inner">
            <input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder={isAuthenticated ? "Say hi…" : "Sign in to chat"}
              className="min-w-0 flex-1 rounded-full bg-transparent px-3 outline-none focus:outline-2 focus:outline-teal-600"
            />
            <button
              type="button"
              onClick={onSend}
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Send
            </button>
          </div>
        </div>
      </aside>

      <section className="gh-glass z-20 order-2 mx-3 my-2 rounded-3xl p-4 lg:absolute lg:bottom-4 lg:left-1/2 lg:mx-auto lg:w-[min(780px,calc(100vw-2rem))] lg:-translate-x-1/2">
        {featured ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex min-w-[200px] flex-1 items-center gap-3">
              {featured.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl">
                  🛍️
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-extrabold">{featured.name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-teal-700">{naira(price)}</span>
                  {myOffer ? (
                    <span className="truncate text-xs text-slate-500">
                      Your offer {naira(myOffer.amount)}
                      {myOffer.status !== "pending" ? ` · ${myOffer.status}` : ""}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">
                  {liveDealActive(featured, dealNow) ? (
                    <>
                      Deal closes <b className="text-slate-900"><LiveDealCountdown product={featured} /></b>
                    </>
                  ) : (
                    <>
                      {liveProductCta(featured)} <b className="text-slate-900">{naira(price)}</b>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2">
              {offersOn && !featured.contact_merchant_only ? (
                <div className="flex self-start rounded-full bg-slate-200/70 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMode("buy")}
                    className={`rounded-full px-4 py-1.5 ${mode === "buy" ? "bg-white shadow" : "text-slate-500"}`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("offer")}
                    className={`rounded-full px-4 py-1.5 ${mode === "offer" ? "bg-white shadow" : "text-slate-500"}`}
                  >
                    Negotiate
                  </button>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                {mode === "offer" && offersOn ? (
                  <>
                    <div className="flex items-center rounded-full bg-white shadow-inner">
                      <button type="button" className="h-10 w-9 text-lg font-bold" onClick={() => bump(-1)}>
                        −
                      </button>
                      <input
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        type="number"
                        className="h-10 w-28 rounded bg-transparent text-center font-extrabold"
                      />
                      <button type="button" className="h-10 w-9 text-lg font-bold" onClick={() => bump(1)}>
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={offerBusy}
                      onClick={() => void sendOffer()}
                      className="h-10 rounded-full bg-teal-600 px-5 text-sm font-bold text-white hover:bg-teal-700"
                    >
                      Offer
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  className="h-10 rounded-full bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700"
                >
                  {liveProductCta(featured)}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Products appear here when the store pins them.</p>
        )}
      </section>

      {featured ? (
        <InstantOrderModal
          isOpen={orderOpen}
          onClose={() => setOrderOpen(false)}
          productId={featured.id}
          productName={featured.name}
          productImage={featured.image || ""}
          unitPrice={price}
          merchantId={store.id}
          qty={1}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userPhone={userPhone}
          liveSessionId={session.id}
          registerInterest={Boolean(featured.contact_merchant_only)}
          onRegisterInterest={async ({ fullName, phone, email }) => {
            const bits = [fullName, phone, email].filter(Boolean).join(" · ");
            await onChat?.(`Registering interest in ${featured.name}${bits ? ` — ${bits}` : "."}`);
          }}
          onOrderPlaced={(order: OrderDetailsResponse) => {
            setOrderOpen(false);
            toast.success(order?.id ? "Order placed from this live." : "Order placed.");
          }}
        />
      ) : null}
    </div>
  );
}
