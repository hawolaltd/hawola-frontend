import LiveEmojiRain from "@/components/live/LiveEmojiRain";
import LiveDealCountdown from "@/components/live/LiveDealCountdown";
import LiveDealProgress from "@/components/live/LiveDealProgress";
import InstantOrderModal from "@/components/product/InstantOrderModal";
import {
  couponFromPayload,
  LiveChatCouponCard,
  LiveChatOfferCard,
  LiveChatPrivateTag,
  LiveChatProductCard,
  offerFromPayload,
  productFromPayload,
} from "@/components/live/LiveChatEmbeds";
import { liveDealActive, liveProductCta, liveSellingPrice, useLiveDealClock } from "@/lib/liveDeal";
import {
  liveDealPath,
  sortOnAirLiveProducts,
  type LiveMessage,
  type LiveOffer,
  type LiveProduct,
  type LiveSession,
  type LiveSticker,
} from "@/lib/hawolaLive";
import { LIVE_STICKERS } from "@/lib/liveStickers";
import { glasshouseEmbedUrl, streamPlatformLabel } from "@/lib/liveStream";
import { useLiveChatSplit } from "@/lib/livePaneResize";
import type { OrderDetailsResponse } from "@/types/product";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function naira(v: string | number | null | undefined) {
  return `₦${Number(v || 0).toLocaleString()}`;
}

function glassEmbed(url: string) {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("mute", "1");
    u.searchParams.set("playsinline", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("enablejsapi", "1");
    u.searchParams.set("modestbranding", "1");
    return u.toString();
  } catch {
    return url;
  }
}

/* Glass card wrapper */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/60 ${className}`}
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(22px) saturate(1.4)",
        WebkitBackdropFilter: "blur(22px) saturate(1.4)",
        boxShadow: "0 8px 32px rgba(15,31,29,0.14)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

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
  onAcceptCounter,
  userEmail,
  userPhone,
}: {
  session: LiveSession;
  messages: LiveMessage[];
  draft: string;
  likes: number;
  liked: boolean;
  isAuthenticated: boolean;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onChat?: (text: string) => Promise<void> | void;
  onSticker: (sticker: LiveSticker) => void;
  onLike: () => void;
  onCoupon: (code: string) => void;
  onOffer?: (productId: number, amount: number) => Promise<LiveOffer | null>;
  onAcceptCounter?: (productId: number) => Promise<LiveOffer | null>;
  userEmail?: string | null;
  userPhone?: string | null;
}) {
  const chatBox = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /* resizable chat panel */
  const { width: chatWidth, dragging: resizingChat, stageRef, handleProps } = useLiveChatSplit({
    storageKey: "hawola-live-gh-chat-width",
    min: 300,
    max: 520,
    initial: 360,
    reserved: 580,
  });

  const [isDesktop, setIsDesktop] = useState(false);
  const [featuredId, setFeaturedId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerBusy, setOfferBusy] = useState(false);
  const [offerMode, setOfferMode] = useState<"buy" | "neg">("buy");
  const [muted, setMuted] = useState(true);
  const [likePing, setLikePing] = useState<{ id: number; emoji: string } | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  const embed = glassEmbed(glasshouseEmbedUrl(session.embed_url || "", session.stream_platform));
  const products = sortOnAirLiveProducts(session.products || []);
  const dealNow = useLiveDealClock(products);
  const stickers = session.stickers?.length ? session.stickers : LIVE_STICKERS;
  const store = session.merchant;
  const offersOn = Boolean(session.offers_enabled);
  const myOffers = session.my_offers || [];
  const pinned = session.pinned_message;

  const featured = useMemo(() => {
    if (!products.length) return null;
    return products.find((p) => p.id === featuredId) || products[0];
  }, [products, featuredId]);

  const myOffer = useMemo(() => {
    if (!featured) return null;
    return myOffers.find((r) => r.product_id === featured.id) || null;
  }, [featured, myOffers]);

  const price = featured ? Number(liveSellingPrice(featured, dealNow) || 0) : 0;

  /* desktop breakpoint — drives inline grid style */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* auto-scroll chat */
  useEffect(() => {
    const box = chatBox.current;
    if (!box) return;
    const near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (near) box.scrollTop = box.scrollHeight;
  }, [messages.length]);

  /* pre-fill offer amount at 80% of price */
  useEffect(() => {
    if (offerMode === "neg" && featured && !offerAmount) {
      setOfferAmount(String(Math.max(100, Math.round((price * 0.8) / 500) * 500)));
    }
  }, [offerMode, featured?.id, offerAmount, price]);

  /* YouTube mute/unmute via postMessage */
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

  const openOrder = (product?: LiveProduct | null) => {
    if (product) setFeaturedId(product.id);
    setOrderOpen(true);
  };

  const sendOffer = async () => {
    if (!featured || !onOffer) return;
    const amount = Number(offerAmount);
    if (!amount) { toast.error("Enter your offer."); return; }
    setOfferBusy(true);
    try {
      await onOffer(featured.id, amount);
      setOfferAmount("");
    } finally {
      setOfferBusy(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#eef2f1", color: "#0f1f1d" }}
    >
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 bg-white/80 px-4 py-2.5" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="flex min-w-0 items-center gap-3">
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ background: store.primary_color || "#0d9488" }}
            >
              {(store.store_name || "S").slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold tracking-tight">
                {store.store_name}
                <span className="text-teal-600"> Live</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500">
              {store.support_phone ? (
                <a href={`tel:${store.support_phone}`} className="hover:text-slate-800">{store.support_phone}</a>
              ) : null}
              {store.support_email ? (
                <a href={`mailto:${store.support_email}`} className="hover:text-slate-800 truncate">{store.support_email}</a>
              ) : null}
              <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:underline">
                Visit store
              </a>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
          <span>👁 {(session.viewer_count || 0).toLocaleString()} watching</span>
          {embed ? (
            <button type="button" onClick={toggleMute} className="rounded-lg border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold hover:bg-white">
              {muted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => { setLikePing({ id: Date.now(), emoji: "❤️" }); onLike(); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${liked ? "bg-rose-500 text-white" : "border border-black/10 bg-white/80 hover:bg-white"}`}
          >
            ♥ {likes}
          </button>
        </div>
      </header>

      {/* ── 3-column body ─────────────────────────────────────────────── */}
      <main
        ref={(el) => { stageRef.current = el; }}
        style={
          isDesktop
            ? { gridTemplateColumns: `320px 1fr 8px ${chatWidth}px` }
            : undefined
        }
        className={`min-h-0 flex-1 grid grid-cols-1 overflow-y-auto lg:overflow-hidden ${resizingChat ? "select-none [&_iframe]:pointer-events-none" : ""
          }`}
      >

        {/* ── Products panel ──────────────────────────────────────────── */}
        <aside className="order-2 flex min-h-0 flex-col overflow-hidden border-b border-black/10 bg-white/60 max-lg:max-h-[min(44vh,22rem)] lg:order-1 lg:h-full lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-black/10 px-4 py-3 font-semibold text-slate-800">
            Products{" "}
            <span className="font-normal text-slate-400">({products.length})</span>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3" style={{ scrollbarWidth: "thin" }}>
            {products.length === 0 ? (
              <p className="px-1 py-6 text-xs text-slate-400">Pins land here as the store sells.</p>
            ) : (
              products.map((p) => {
                const on = featured?.id === p.id;
                const dealActive = liveDealActive(p, dealNow);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFeaturedId(p.id)}
                    className={`w-full overflow-hidden rounded-2xl bg-white text-left transition-shadow ${on ? "ring-2 ring-teal-600" : "hover:shadow-md"
                      }`}
                  >
                    <div className="relative h-24 bg-slate-100">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🛍️</div>
                      )}
                      <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? "bg-rose-500 text-white" : "bg-white/90 text-slate-700"}`}>
                        {on ? "● ON AIR" : dealActive ? "DEAL" : "PIN"}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="truncate text-sm font-bold text-slate-800">{p.name}</div>
                      <div className="mt-0.5 flex justify-between text-xs">
                        {dealActive ? (
                          <>
                            <span className="font-bold text-teal-700">{naira(p.deal_price)}</span>
                            <LiveDealCountdown product={p} className="font-mono text-slate-500" />
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-teal-700">{naira(liveSellingPrice(p, dealNow))}</span>
                            <span className="text-slate-400">{liveProductCta(p)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Stage: video + featured product card ────────────────────── */}
        <section className="order-1 flex min-h-0 min-w-0 flex-col overflow-y-auto lg:order-2" style={{ scrollbarWidth: "thin" }}>
          {/* Video */}
          <div className="relative aspect-video w-full shrink-0 bg-black">
            {embed ? (
              <iframe
                ref={iframeRef}
                title={session.title || "Live stream"}
                src={embed}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/60">
                Waiting for stream
              </div>
            )}
            {(session.stream_platform === "instagram" || session.stream_platform === "tiktok") && session.youtube_url ? (
              <a
                href={session.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Open on {streamPlatformLabel(session.stream_platform)}
              </a>
            ) : null}
            <LiveEmojiRain messages={messages} ping={likePing} />
          </div>

          {/* Featured product card */}
          <div className="space-y-3 px-4 pb-6 pt-4">
            {featured ? (
              <GlassCard className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {featured.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-3xl">🛍️</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-teal-600">On air now</div>
                    <div className="mt-0.5 truncate text-lg font-extrabold text-slate-900">{featured.name}</div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                      {liveDealActive(featured, dealNow) ? (
                        <>
                          <span className="line-through text-slate-400">{naira(featured.effective_price || featured.price)}</span>
                          <span className="font-bold text-teal-700">{naira(featured.deal_price)}</span>
                          <LiveDealCountdown product={featured} className="font-mono font-bold text-slate-500" />
                        </>
                      ) : (
                        <span className="text-2xl font-extrabold text-teal-700">{naira(price)}</span>
                      )}
                      {myOffer ? (
                        <span className="text-xs text-slate-500">
                          · Your offer {naira(myOffer.amount)}
                          {myOffer.status !== "pending" ? ` · ${myOffer.status}` : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openOrder(featured)}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                    >
                      {liveProductCta(featured)}
                    </button>
                    {offersOn && !featured.contact_merchant_only ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
                        onClick={() => setOfferMode((m) => (m === "neg" ? "buy" : "neg"))}
                      >
                        Negotiate price
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Deal progress bar */}
                {liveDealActive(featured, dealNow) ? <LiveDealProgress product={featured} /> : null}

                {/* Negotiate pane */}
                {offersOn && !featured.contact_merchant_only && offerMode === "neg" ? (
                  <div className="border-t border-black/10 px-4 pb-4 pt-3">
                    <p className="mb-2 text-xs text-slate-500">
                      Enter your preferred price. The store can agree, decline, or counter.
                    </p>
                    {myOffer?.status === "accepted" && myOffer.coupon?.code ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-teal-700">
                          ✓ Accepted — use <span className="font-bold">{myOffer.coupon.code}</span> at checkout.
                        </p>
                        <button
                          type="button"
                          className="rounded-full bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-700"
                          onClick={() => { onCoupon(String(myOffer.coupon?.code)); openOrder(featured); }}
                        >
                          Order with coupon
                        </button>
                      </div>
                    ) : myOffer?.status === "declined" ? (
                      <p className="text-sm text-slate-500">That offer was declined. Try another amount.</p>
                    ) : (
                      <>
                        {myOffer?.status === "pending" && myOffer.countered_by_merchant ? (
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="text-sm text-slate-600">
                              Store counters at <span className="font-bold">{naira(myOffer.amount)}</span>
                            </p>
                            <button
                              type="button"
                              disabled={offerBusy}
                              className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                              onClick={async () => {
                                if (!onAcceptCounter) return;
                                setOfferBusy(true);
                                try { await onAcceptCounter(featured.id); }
                                finally { setOfferBusy(false); }
                              }}
                            >
                              Accept store price
                            </button>
                          </div>
                        ) : myOffer?.status === "pending" ? (
                          <p className="mb-2 text-sm text-slate-500">Waiting on the store for {naira(myOffer.amount)}.</p>
                        ) : null}
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={100}
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder="Your offer (₦)"
                            className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-teal-500"
                          />
                          <button
                            type="button"
                            disabled={offerBusy}
                            onClick={() => void sendOffer()}
                            className="rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                          >
                            {offerBusy ? "Sending…" : "Send offer"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </GlassCard>
            ) : (
              <GlassCard className="p-5 text-sm text-slate-500">
                Products appear here when the store pins them.
              </GlassCard>
            )}

            {/* Promo link */}
            {session.promo?.slug && session.promo.is_open !== false && !session.promo.expired ? (
              <a
                href={liveDealPath(session.merchant?.slug, session.promo.slug) || "#"}
                className="flex items-center justify-between gap-2 rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 hover:bg-amber-100"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">Tonight's deals</span>
                <span className="truncate text-xs font-semibold text-amber-900">
                  {session.promo.title || "Open deal page"} →
                </span>
              </a>
            ) : null}
          </div>
        </section>

        {/* ── Drag handle ─────────────────────────────────────────────── */}
        <button
          type="button"
          aria-label="Drag to resize chat panel"
          title="Drag to resize chat panel"
          className="relative z-20 hidden cursor-col-resize items-stretch justify-center bg-transparent after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5 lg:flex"
          {...handleProps}
        >
          <span className="my-10 w-1 rounded-full bg-black/15 transition-colors hover:bg-teal-500" />
        </button>

        {/* ── Chat panel ──────────────────────────────────────────────── */}
        <aside className="order-3 flex min-h-0 flex-col overflow-hidden border-t border-black/10 bg-white/70 max-lg:h-[min(50vh,22rem)] max-lg:flex-none lg:order-none lg:h-auto lg:border-l lg:border-t-0">
          <div className="shrink-0 border-b border-black/10 px-4 py-3 font-semibold text-slate-800">
            Live chat
          </div>

          {/* Pinned message */}
          {pinned ? (
            <div className="mx-3 mt-3 shrink-0 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">Pinned</p>
              <p className="mt-0.5 text-xs font-semibold text-amber-900">
                {pinned.sender_name || "Store"} · {pinned.body}
              </p>
            </div>
          ) : null}

          {/* Promo link (chat top) */}
          {session.promo?.slug && session.promo.is_open !== false && !session.promo.expired ? (
            <a
              href={liveDealPath(session.merchant?.slug, session.promo.slug) || "#"}
              className="mx-3 mt-3 shrink-0 rounded-xl bg-teal-600/10 px-3 py-2 text-xs font-semibold text-teal-900 hover:bg-teal-600/15"
            >
              Tonight's deals → {session.promo.title || "Open deal page"}
            </a>
          ) : null}

          {/* Messages */}
          <div ref={chatBox} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm" style={{ scrollbarWidth: "thin" }}>
            {messages.length === 0 ? (
              <p className="pt-4 text-center text-slate-400">The room is quiet. Say hello 👋</p>
            ) : null}
            {messages.map((m) => {
              const isMerchant = m.sender_type === "merchant" || m.sender_type === "system";
              const isOrder = m.kind === "order";
              const coupon = couponFromPayload(m.payload);
              const chatProduct = productFromPayload(m.payload);
              const offer = offerFromPayload(m.payload);
              return (
                <div key={m.id} className={`flex ${isMerchant && !isOrder ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${isOrder
                        ? "w-full bg-teal-600/10 text-teal-900"
                        : isMerchant
                          ? "rounded-br-md bg-teal-700 text-white"
                          : "rounded-bl-md bg-white text-slate-800 shadow-sm"
                      }`}
                  >
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide opacity-70">
                      {m.sender_name || "Shopper"}
                      {m.kind === "offer" || m.payload?.private ? <LiveChatPrivateTag /> : null}
                    </p>
                    <p className={`mt-0.5 break-words ${m.kind === "reaction" ? "text-xl" : ""}`}>
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
                    {m.kind === "coupon" && coupon ? (
                      <LiveChatCouponCard coupon={coupon} onUse={(code) => onCoupon(code)} />
                    ) : null}
                    {m.kind === "product" && chatProduct ? (
                      <LiveChatProductCard
                        product={chatProduct}
                        onOpen={(p) => { setFeaturedId(p.id); setOrderOpen(true); }}
                      />
                    ) : null}
                    {offer ? <LiveChatOfferCard offer={offer} /> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input area */}
          <div className="shrink-0 space-y-2 border-t border-black/10 bg-white/80 p-3">
            {/* Negotiate in chat */}
            {offersOn && featured && !featured.contact_merchant_only && onOffer ? (
              <div className="rounded-2xl bg-fuchsia-50 px-3 py-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-fuchsia-700">Negotiate</p>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="number"
                    min={100}
                    placeholder="Your price (₦)"
                    className="min-w-0 flex-1 rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-fuchsia-500"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const amount = Number((e.target as HTMLInputElement).value);
                        if (!amount) return;
                        setOfferBusy(true);
                        try { await onOffer(featured.id, amount); (e.target as HTMLInputElement).value = ""; }
                        finally { setOfferBusy(false); }
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={offerBusy}
                    className="rounded-full bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-700 disabled:opacity-50"
                    onClick={async (e) => {
                      const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null);
                      const amount = Number(input?.value);
                      if (!amount) return;
                      setOfferBusy(true);
                      try { await onOffer(featured.id, amount); if (input) input.value = ""; }
                      finally { setOfferBusy(false); }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : null}

            {/* Stickers */}
            <div className="flex flex-wrap justify-between gap-1">
              {stickers.slice(0, 8).map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => onSticker(sticker)}
                  className="text-xl transition-transform hover:scale-125"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>

            {/* Text + send */}
            <div className="flex gap-2 rounded-full border border-black/10 bg-white p-1.5">
              <input
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder={isAuthenticated ? "Say hi…" : "Sign in to chat"}
                className="min-w-0 flex-1 rounded-full bg-transparent px-3 text-sm outline-none"
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
      </main>

      {/* ── Instant order modal ───────────────────────────────────────── */}
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
          allowPrivateOffer={offersOn && !featured.contact_merchant_only}
          liveOffer={myOffer}
          onPrivateOffer={(amount) => onOffer?.(featured.id, amount)}
          onAcceptCounter={() => onAcceptCounter?.(featured.id)}
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
