import LiveEmojiRain from "@/components/live/LiveEmojiRain";
import LivePlayer from "@/components/live/LivePlayer";
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
import { LiveThemeToggle, liveThemeStyle, useLiveTheme } from "@/lib/liveTheme";
import {
  liveDealPath,
  sortOnAirLiveProducts,
  type LiveMessage,
  type LiveOffer,
  type LiveProduct,
  type LiveSession,
  type LiveSticker,
} from "@/lib/hawolaLive";
import { useLiveChatSplit } from "@/lib/livePaneResize";
import { LIVE_STICKERS } from "@/lib/liveStickers";
import type { OrderDetailsResponse } from "@/types/product";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function whatsappHref(raw?: string | null) {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const digits = v.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

function StoreAvatar({ name, logo, color }: { name?: string; logo?: string; color?: string }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/15" />;
  }
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white"
      style={{ backgroundColor: color || "#c026d3" }}
    >
      {(name || "S").slice(0, 1)}
    </span>
  );
}

/** Left sidebar product card */
function ProductCard({
  product,
  selected,
  dealNow,
  onClick,
}: {
  product: LiveProduct;
  selected: boolean;
  dealNow: number;
  onClick: () => void;
}) {
  const dealActive = liveDealActive(product, dealNow);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selected
        ? "border-fuchsia-500 bg-fuchsia-500/10"
        : "border-[color:var(--lv-border)] bg-[var(--lv-card)] hover:bg-[var(--lv-hover)]"
        }`}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-black/30 text-3xl">
          🛍️
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-[var(--lv-fg)]">{product.name}</div>
        <div className="mt-0.5 text-xs text-[var(--lv-muted)]">
          {dealActive ? (
            <>
              <span className="mr-1 line-through opacity-60">
                {naira(product.effective_price || product.price)}
              </span>
              <span className="font-bold text-[color:var(--lv-deal)]">{naira(product.deal_price)}</span>
              {" · "}
              <LiveDealCountdown product={product} className="font-mono font-bold text-[color:var(--lv-deal)]" />
            </>
          ) : (
            <>
              {product.contact_merchant_only ? (
                <span className="font-semibold text-[color:var(--lv-accent)]">Register Interest</span>
              ) : (
                <>
                  Buy{" "}
                  <span className="font-bold text-[color:var(--lv-price)]">
                    {naira(liveSellingPrice(product, dealNow))}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        {product.on_air && (
          <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
            <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
            On air
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

export default function LiveSaleStudio({
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
  onDraftChange: (value: string) => void;
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

  /* resizable chat panel – drag handle sits between stage and chat */
  const { width: chatWidth, dragging: resizingChat, stageRef, handleProps } = useLiveChatSplit({
    storageKey: "hawola-live-chat-width",
    min: 280,
    max: 640,
    initial: 400,
    reserved: 560,
  });
  const [featuredId, setFeaturedId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerBusy, setOfferBusy] = useState(false);
  const [chatOfferOpen, setChatOfferOpen] = useState(false);
  const [paneOfferOpen, setPaneOfferOpen] = useState(false);
  const [likePing, setLikePing] = useState<{ id: number; emoji: string } | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  const products = sortOnAirLiveProducts(session.products || []);
  const dealNow = useLiveDealClock(products);
  const { isDark, toggleLiveTheme } = useLiveTheme();
  const stickers = session.stickers?.length ? session.stickers : LIVE_STICKERS;
  const pinned = session.pinned_message;
  const store = session.merchant;
  const title = session.title || store?.store_name || "Live sale";
  const offersOn = Boolean(session.offers_enabled);
  const myOffers = session.my_offers || [];

  const wa = whatsappHref(store.whatsapp || "");
  const phone = (store.support_phone || "").trim();
  const email = (store.support_email || "").trim();

  const featured = useMemo(() => {
    if (!products.length) return null;
    return products.find((p) => p.id === featuredId) || products[0];
  }, [products, featuredId]);

  const myOfferForFeatured = useMemo(() => {
    if (!featured) return null;
    return myOffers.find((row) => row.product_id === featured.id) || null;
  }, [featured, myOffers]);

  /* auto-scroll chat to bottom on new messages */
  useEffect(() => {
    const box = chatBox.current;
    if (!box) return;
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (nearBottom) box.scrollTop = box.scrollHeight;
  }, [messages.length]);

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

  return (
    <div
      style={liveThemeStyle(isDark)}
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--lv-bg)] text-[var(--lv-fg)]"
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[color:var(--lv-border)] px-4 py-2.5">
        {/* Store identity */}
        <div className="flex min-w-0 items-center gap-3">
          <StoreAvatar name={store.store_name} logo={store.logo} color={store.primary_color} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-extrabold">
                {store.store_name}
                <span className="text-[color:var(--lv-accent)]"> Live</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--lv-muted)]">
              {phone ? (
                <a href={`tel:${phone}`} className="hover:text-[var(--lv-fg)]">{phone}</a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="truncate hover:text-[var(--lv-fg)]">{email}</a>
              ) : null}
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--lv-price)]">
                  WhatsApp
                </a>
              ) : null}
              <a
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[color:var(--lv-accent)] hover:underline"
              >
                Visit store
              </a>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2 text-sm text-[var(--lv-muted)]">
          <span>👁 {(session.viewer_count || 0).toLocaleString()} watching</span>
          <LiveThemeToggle
            isDark={isDark}
            onToggle={toggleLiveTheme}
            className="rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-chip)] text-[var(--lv-fg)] hover:bg-[var(--lv-hover)]"
          />
          <button
            type="button"
            onClick={() => { setLikePing({ id: Date.now(), emoji: "❤️" }); onLike(); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${liked ? "bg-red-600 text-white" : "bg-[var(--lv-chip)] hover:bg-[var(--lv-hover)]"
              }`}
          >
            ♥ {likes}
          </button>
        </div>
      </header>

      <main
        ref={(el) => {
          stageRef.current = el;
        }}
        style={{ ["--live-chat-w" as string]: `${chatWidth}px` }}
        className={`thin grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:overflow-hidden lg:[grid-template-columns:280px_minmax(0,1fr)_8px_var(--live-chat-w)] ${
          resizingChat ? "select-none [&_iframe]:pointer-events-none" : ""
        }`}
      >
        <aside className="order-2 flex min-h-0 flex-col overflow-hidden border-b border-[color:var(--lv-border)] max-lg:max-h-[min(42vh,22rem)] lg:col-start-1 lg:order-none lg:h-full lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-[color:var(--lv-border)] px-4 py-3 font-semibold">
            Products{" "}
            <span className="font-normal text-[var(--lv-muted)]">({products.length})</span>
          </div>
          <div className="thin min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3">
            {products.length === 0 ? (
              <p className="px-1 py-6 text-xs text-[var(--lv-muted)]">
                The store will pin products here as they sell.
              </p>
            ) : (
              products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  selected={featured?.id === p.id}
                  dealNow={dealNow}
                  onClick={() => setFeaturedId(p.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Stage: video + featured product card ────────────────────── */}
        <section className="thin order-1 flex min-h-0 min-w-0 flex-col overflow-y-auto lg:col-start-2 lg:order-none">
          {/* Video */}
          <div className="relative aspect-video w-full shrink-0 bg-black">
            <LivePlayer
              embedUrl={session.embed_url}
              title={title}
              fill
              platform={session.stream_platform}
              sourceUrl={session.youtube_url}
            />
            <LiveEmojiRain messages={messages} ping={likePing} />
          </div>

          {/* Featured product card */}
          <div className="space-y-3 px-4 pt-4 pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+2.5rem))]">
            {featured ? (
              <div className="overflow-hidden rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)]">
                {/* Product info row */}
                <div className="flex items-center gap-4 p-4">
                  {featured.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-black/30 text-4xl">
                      🛍️
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--lv-accent)]">
                      On air now
                    </div>
                    <div className="mt-0.5 truncate text-lg font-bold text-[var(--lv-fg)]">
                      {featured.name}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                      {liveDealActive(featured, dealNow) ? (
                        <>
                          <span className="line-through opacity-50 text-[var(--lv-muted)]">
                            {naira(featured.effective_price || featured.price)}
                          </span>
                          <span className="font-bold text-[color:var(--lv-deal)]">
                            {naira(featured.deal_price)}
                          </span>
                          <LiveDealCountdown
                            product={featured}
                            className="font-mono font-bold text-[color:var(--lv-deal)]"
                          />
                        </>
                      ) : (
                        <span className="font-bold text-[color:var(--lv-price)]">
                          {naira(liveSellingPrice(featured, dealNow))}
                        </span>
                      )}
                      {myOfferForFeatured ? (
                        <span className="text-xs text-[var(--lv-muted)]">
                          · Your offer{" "}
                          <span className="font-bold text-[color:var(--lv-accent)]">
                            {naira(myOfferForFeatured.amount)}
                          </span>
                          {myOfferForFeatured.status !== "pending"
                            ? ` (${myOfferForFeatured.status})`
                            : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {/* CTA button */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openOrder(featured)}
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500"
                    >
                      {liveProductCta(featured)}
                    </button>
                    {offersOn && !featured.contact_merchant_only ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-[var(--lv-fg)] underline underline-offset-2"
                        onClick={() => setPaneOfferOpen((open) => !open)}
                      >
                        Negotiate this price
                      </button>
                    ) : null}
                  </div>
                </div>
                {liveDealActive(featured, dealNow) ? <LiveDealProgress product={featured} /> : null}
              </div>
            ) : (
              <div className="rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)] p-4 text-sm text-[var(--lv-muted)]">
                Products appear here when the store pins them.
              </div>
            )}

            {offersOn && featured && !featured.contact_merchant_only && paneOfferOpen ? (
              <div className="rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">Negotiate</p>
                  <button
                    type="button"
                    aria-label="Close negotiate"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lv-chip)] text-lg leading-none hover:bg-[var(--lv-hover)]"
                    onClick={() => setPaneOfferOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <p className="mb-3 text-xs text-[var(--lv-muted)]">
                  Enter your preferred price. The store can agree, decline, or counter. If they agree, you get a coupon for instant order.
                </p>
                {myOfferForFeatured?.status === "accepted" && myOfferForFeatured.coupon?.code ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-emerald-600">
                      Accepted. Use {myOfferForFeatured.coupon.code} on instant order.
                    </p>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                      onClick={() => {
                        onCoupon(String(myOfferForFeatured.coupon?.code));
                        openOrder(featured);
                      }}
                    >
                      Order with coupon
                    </button>
                  </div>
                ) : myOfferForFeatured?.status === "declined" ? (
                  <p className="text-sm text-[var(--lv-muted)]">That offer was declined. Try another amount.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={100}
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="Your offer (₦)"
                        className="min-w-0 flex-1 rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-input)] px-3 py-2 text-[var(--lv-fg)] placeholder:text-[var(--lv-muted)] outline-none focus:border-fuchsia-500"
                      />
                      <button
                        type="button"
                        disabled={offerBusy}
                        onClick={() => void sendOffer()}
                        className="rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-500 disabled:opacity-50"
                      >
                        {offerBusy ? "Sending" : "Send offer"}
                      </button>
                    </div>
                    {myOfferForFeatured?.status === "pending" && myOfferForFeatured.countered_by_merchant ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-[var(--lv-muted)]">
                          Store counters at {naira(myOfferForFeatured.amount)}.
                        </p>
                        <button
                          type="button"
                          disabled={offerBusy}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 disabled:opacity-50"
                          onClick={async () => {
                            if (!featured || !onAcceptCounter) return;
                            setOfferBusy(true);
                            try {
                              await onAcceptCounter(featured.id);
                            } finally {
                              setOfferBusy(false);
                            }
                          }}
                        >
                          Accept store price
                        </button>
                      </div>
                    ) : myOfferForFeatured?.status === "pending" ? (
                      <p className="text-sm text-[var(--lv-muted)]">
                        Waiting on the store for {naira(myOfferForFeatured.amount)}.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <button
          type="button"
          aria-label="Drag to resize video and chat"
          title="Drag to resize video and chat"
          className="relative z-20 hidden cursor-col-resize items-stretch justify-center bg-transparent after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5 lg:col-start-3 lg:flex"
          {...handleProps}
        >
          <span className="my-8 w-1 rounded-full bg-[var(--lv-border)] hover:bg-[var(--lv-accent)]" />
        </button>

        <aside className="order-3 flex min-h-0 flex-col overflow-hidden border-t border-[color:var(--lv-border)] max-lg:h-[min(48vh,22rem)] max-lg:flex-none lg:col-start-4 lg:h-auto lg:border-l lg:border-t-0">
          <div className="shrink-0 border-b border-[color:var(--lv-border)] px-4 py-3 font-semibold">Live chat</div>
          {session.promo?.slug && session.promo.is_open !== false && !session.promo.expired ? (
            <a
              href={liveDealPath(session.merchant?.slug, session.promo.slug) || "#"}
              className="mx-3 mt-3 block shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 hover:bg-amber-400/15"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[color:var(--lv-deal)]">
                Tonight’s deals
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold">
                {session.promo.title || "Open the deal page"} →
              </p>
            </a>
          ) : null}
          {pinned ? (
            <div className="mx-3 mt-3 shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[color:var(--lv-deal)]">
                Pinned
              </p>
              <p className="mt-0.5 text-xs font-semibold">
                {pinned.sender_name || "Store"} · {pinned.body}
              </p>
            </div>
          ) : null}

          {/* Messages */}
          <div ref={chatBox} className="thin min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm">
            {messages.length === 0 ? (
              <p className="pt-4 text-center text-[var(--lv-muted)]">The room is quiet. Say hello 👋</p>
            ) : null}
            {messages.map((m) => {
              const coupon = couponFromPayload(m.payload);
              const chatProduct = productFromPayload(m.payload);
              const offer = offerFromPayload(m.payload);
              const isMerchant = m.sender_type === "merchant" || m.sender_type === "system";
              const isOrder = m.kind === "order";
              return (
                <div
                  key={m.id}
                  className={`flex ${isMerchant && !isOrder ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 ${isOrder
                      ? isDark
                        ? "w-full rounded-xl bg-amber-400/15 text-amber-100"
                        : "w-full rounded-xl bg-amber-100 text-amber-950"
                      : isMerchant
                        ? isDark
                          ? "rounded-br-md bg-fuchsia-600/25 text-[#f5e9ff]"
                          : "rounded-br-md bg-fuchsia-100 text-fuchsia-950"
                        : isDark
                          ? "rounded-bl-md bg-white/10 text-[#e7e9ee]"
                          : "rounded-bl-md bg-slate-200 text-slate-900"
                      }`}
                  >
                    <p
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${isMerchant ? "text-[color:var(--lv-merchant-name)]" : "text-[color:var(--lv-shopper-name)]"
                        }`}
                    >
                      {m.sender_name || "Shopper"}
                      {m.kind === "offer" || m.payload?.private ? <LiveChatPrivateTag /> : null}
                    </p>
                    <p className={`mt-0.5 break-words ${m.kind === "reaction" ? "text-xl" : ""}`}>
                      {m.body.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                        /^https?:\/\//.test(part) ? (
                          <a
                            key={`${m.id}-${i}`}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline underline-offset-2"
                          >
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
                      <LiveChatProductCard product={chatProduct} onOpen={openOrder} />
                    ) : null}
                    {m.kind === "offer" || offer ? (
                      <LiveChatOfferCard
                        offer={offer || { id: m.id, redacted: true, buyer_name: m.sender_name }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat input area */}
          <div className="shrink-0 space-y-2 border-t border-[color:var(--lv-border)] bg-[var(--lv-bg)] p-3">
            {offersOn && featured && !featured.contact_merchant_only && onOffer ? (
              <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-[11px] font-extrabold uppercase tracking-wide text-[color:var(--lv-accent)]"
                    onClick={() => setChatOfferOpen(true)}
                  >
                    Negotiate
                  </button>
                  {chatOfferOpen ? (
                    <button
                      type="button"
                      aria-label="Close negotiate"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lv-chip)] text-base leading-none text-[var(--lv-fg)]"
                      onClick={() => setChatOfferOpen(false)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                {chatOfferOpen ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min={100}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Your price (₦)"
                      className="min-w-0 flex-1 rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-input)] px-3 py-1.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      disabled={offerBusy}
                      onClick={() => void sendOffer()}
                      className="rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Send private
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => onSticker(sticker)}
                  className="rounded-lg px-1.5 text-xl transition-transform hover:scale-125"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
            {/* Text input + send */}
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder={isAuthenticated ? "Say something…" : "Sign in to chat"}
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-input)] px-3 py-2 text-[var(--lv-fg)] placeholder:text-[var(--lv-muted)] outline-none focus:border-fuchsia-500"
              />
              <button
                type="button"
                onClick={onSend}
                className="rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-500"
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* ── Instant order modal ─────────────────────────────────────────── */}
      {featured ? (
        <InstantOrderModal
          isOpen={orderOpen}
          onClose={() => setOrderOpen(false)}
          productId={featured.id}
          productName={featured.name}
          productImage={featured.image || ""}
          unitPrice={Number(liveSellingPrice(featured, dealNow) || featured.price || 0)}
          merchantId={store.id}
          qty={1}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userPhone={userPhone}
          liveSessionId={session.id}
          allowPrivateOffer={offersOn && !featured.contact_merchant_only}
          liveOffer={myOfferForFeatured}
          onPrivateOffer={(amount) => onOffer?.(featured.id, amount)}
          onAcceptCounter={() => onAcceptCounter?.(featured.id)}
          registerInterest={Boolean(featured.contact_merchant_only)}
          onRegisterInterest={async ({ fullName, phone, email: mail }) => {
            const bits = [fullName, phone, mail].filter(Boolean).join(" · ");
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
