import LiveEmojiRain from "@/components/live/LiveEmojiRain";
import LivePlayer from "@/components/live/LivePlayer";
import LiveDealCountdown from "@/components/live/LiveDealCountdown";
import LiveDealProgress from "@/components/live/LiveDealProgress";
import InstantOrderModal from "@/components/product/InstantOrderModal";
import { liveDealActive, liveProductCta, liveSellingPrice, useLiveDealClock } from "@/lib/liveDeal";
import { LiveThemeToggle, liveThemeStyle, useLiveTheme } from "@/lib/liveTheme";
import { liveDealPath, type LiveMessage, type LiveOffer, type LiveProduct, type LiveSession, type LiveSticker } from "@/lib/hawolaLive";
import { LIVE_STICKERS } from "@/lib/liveStickers";
import type { OrderDetailsResponse } from "@/types/product";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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

function storeInitial(name?: string | null) {
  return (name || "S").trim().slice(0, 1).toUpperCase();
}

function StoreAvatar({
  name,
  logo,
  color,
}: {
  name?: string;
  logo?: string;
  color?: string;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20" />
    );
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
  const [featuredId, setFeaturedId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerBusy, setOfferBusy] = useState(false);
  const [likePing, setLikePing] = useState<{ id: number; emoji: string } | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const products = session.products || [];
  const dealNow = useLiveDealClock(products);
  const { isDark, toggleLiveTheme } = useLiveTheme();
  const stickers = session.stickers?.length ? session.stickers : LIVE_STICKERS;
  const pinned = session.pinned_message;
  const store = session.merchant;
  const title = session.title || store?.store_name || "Live sale";
  const offersOn = Boolean(session.offers_enabled);
  const myOffers = session.my_offers || [];

  const featured = useMemo(() => {
    if (!products.length) return null;
    return products.find((p) => p.id === featuredId) || products[0];
  }, [products, featuredId]);

  const myOfferForFeatured = useMemo(() => {
    if (!featured) return null;
    return myOffers.find((row) => row.product_id === featured.id) || null;
  }, [featured, myOffers]);

  useEffect(() => {
    const box = chatBox.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages.length]);

  const openOrder = (product?: LiveProduct | null) => {
    if (product) setFeaturedId(product.id);
    setOrderOpen(true);
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

  const bumpOffer = (inc: number) => {
    const list = Number(liveSellingPrice(featured, dealNow) || featured?.price || 0);
    const current = Number(offerAmount) || Number(myOfferForFeatured?.amount) || Math.max(100, list * 0.7);
    setOfferAmount(String(Math.round(current + inc)));
  };

  const wa = whatsappHref(store.whatsapp || "");
  const phone = (store.support_phone || "").trim();
  const email = (store.support_email || "").trim();

  return (
    <div
      style={liveThemeStyle(isDark)}
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--lv-bg)] text-[var(--lv-fg)]"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--lv-border)] px-4 py-2.5">
        <div className="flex min-w-0 items-start gap-3">
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/15" />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ backgroundColor: store.primary_color || "#c026d3" }}
            >
              {(store.store_name || "S").slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-extrabold">
                {store.store_name}
                <span className="text-fuchsia-400"> Live</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-xs font-bold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--lv-muted)]">
              {phone ? (
                <a href={`tel:${phone}`} className="hover:text-[var(--lv-fg)]">
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="truncate hover:text-[var(--lv-fg)]">
                  {email}
                </a>
              ) : null}
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300">
                  WhatsApp
                </a>
              ) : null}
              <a
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-fuchsia-300 hover:text-fuchsia-200"
              >
                Visit store
              </a>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm text-[var(--lv-muted)]">
          <span>
            👁 {(session.viewer_count || 0).toLocaleString()} watching
          </span>
          <LiveThemeToggle
            isDark={isDark}
            onToggle={toggleLiveTheme}
            className="rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-chip)] text-[var(--lv-fg)] hover:bg-[var(--lv-hover)]"
          />
          <button
            type="button"
            onClick={() => {
              setLikePing({ id: Date.now(), emoji: "❤️" });
              onLike();
            }}
            className={`rounded-lg px-2 py-1 text-xs font-bold ${liked ? "bg-red-600 text-white" : "bg-[var(--lv-chip)]"}`}
          >
            ♥ {likes}
          </button>
        </div>
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[280px_minmax(0,1fr)_minmax(280px,340px)] lg:overflow-hidden">
        <aside className="order-2 flex min-h-0 flex-col overflow-hidden border-b border-[color:var(--lv-border)] max-lg:max-h-[min(36vh,18rem)] lg:order-1 lg:h-auto lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-[color:var(--lv-border)] px-4 py-3 font-semibold">
            Products <span className="font-normal text-[var(--lv-muted)]">({products.length})</span>
          </div>
          <div className="thin min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {products.length === 0 ? (
              <p className="px-1 py-6 text-xs text-[var(--lv-muted)]">The store will pin products here as they sell.</p>
            ) : (
              products.map((p) => {
                const on = featured?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFeaturedId(p.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                      on
                        ? "border-fuchsia-500 bg-fuchsia-500/10"
                        : "border-[color:var(--lv-border)] bg-[var(--lv-card)] hover:bg-[var(--lv-hover)]"
                    }`}
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-black/30" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-xs text-[var(--lv-muted)]">
                        {liveDealActive(p, dealNow) ? (
                          <>
                            <span className="mr-1 line-through opacity-60">{naira(p.effective_price || p.price)}</span>
                            <span className="font-bold text-amber-300">{naira(p.deal_price)}</span>
                            {" · "}
                            <LiveDealCountdown product={p} className="font-mono font-bold text-amber-300" />
                          </>
                        ) : p.contact_merchant_only ? (
                          naira(liveSellingPrice(p, dealNow))
                        ) : (
                          <>Buy {naira(liveSellingPrice(p, dealNow))}</>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="order-1 flex min-w-0 flex-col lg:order-2 lg:min-h-0 lg:overflow-hidden">
          <div className="relative aspect-video w-full shrink-0 bg-black">
            <LivePlayer embedUrl={session.embed_url} title={title} fill />
            <LiveEmojiRain messages={messages} ping={likePing} />
          </div>
          <div className="space-y-3 p-4 max-lg:shrink-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {featured ? (
              <div className="overflow-hidden rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)]">
                <div className="flex min-w-0 items-center gap-3 p-4">
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-black/30" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-400">
                    On air now
                  </div>
                  <div className="truncate text-lg font-bold">{featured.name}</div>
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-[var(--lv-muted)]">
                    <span className="shrink-0">{liveProductCta(featured)}</span>
                    {liveDealActive(featured, dealNow) ? (
                      <>
                        <span className="line-through opacity-60">
                          {naira(featured.effective_price || featured.price)}
                        </span>
                        <span className="break-all font-bold text-amber-300">
                          {naira(featured.deal_price)}
                        </span>
                        <LiveDealCountdown
                          product={featured}
                          className="shrink-0 font-mono font-bold text-amber-300"
                        />
                      </>
                    ) : (
                      <span className="break-all font-bold text-emerald-400">
                        {naira(liveSellingPrice(featured, dealNow))}
                      </span>
                    )}
                    {myOfferForFeatured ? (
                      <>
                        {" "}
                        · Your offer{" "}
                        <span className="font-bold text-fuchsia-300">{naira(myOfferForFeatured.amount)}</span>
                        {myOfferForFeatured.status !== "pending"
                          ? ` (${myOfferForFeatured.status})`
                          : ""}
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openOrder(featured)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500"
                >
                  {liveProductCta(featured)}
                </button>
                </div>
                {liveDealActive(featured, dealNow) ? <LiveDealProgress product={featured} /> : null}
              </div>
            ) : (
              <div className="rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)] p-4 text-sm text-[var(--lv-muted)]">
                Products appear here when the store pins them.
              </div>
            )}

            {offersOn && featured && !featured.contact_merchant_only ? (
              <div className="rounded-xl border border-[color:var(--lv-border)] bg-[var(--lv-card)] p-4">
                <p className="mb-2 text-sm font-semibold">Private offer</p>
                <p className="mb-3 text-xs text-[var(--lv-muted)]">
                  Send a price just for you. If the store accepts, you get a coupon for instant order.
                </p>
                {myOfferForFeatured?.status === "accepted" && myOfferForFeatured.coupon?.code ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-emerald-300">
                      Accepted. Use {myOfferForFeatured.coupon.code} on instant order.
                    </p>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold"
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--lv-chip)] px-3 py-1.5 text-sm hover:bg-[var(--lv-hover)]"
                        onClick={() => bumpOffer(500)}
                      >
                        +₦500
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--lv-chip)] px-3 py-1.5 text-sm hover:bg-[var(--lv-hover)]"
                        onClick={() => bumpOffer(1000)}
                      >
                        +₦1,000
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--lv-chip)] px-3 py-1.5 text-sm hover:bg-[var(--lv-hover)]"
                        onClick={() => bumpOffer(5000)}
                      >
                        +₦5,000
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={100}
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="Your offer (₦)"
                        className="min-w-0 flex-1 rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-input)] px-3 py-2 text-[var(--lv-fg)] outline-none focus:border-fuchsia-500"
                      />
                      <button
                        type="button"
                        disabled={offerBusy}
                        onClick={() => void sendOffer()}
                        className="rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold hover:bg-fuchsia-500 disabled:opacity-50"
                      >
                        {offerBusy ? "Sending" : "Send offer"}
                      </button>
                    </div>
                    {myOfferForFeatured?.status === "pending" ? (
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

        <aside className="order-3 flex min-h-0 flex-col overflow-hidden border-t border-[color:var(--lv-border)] max-lg:h-[min(48vh,22rem)] max-lg:flex-none lg:h-auto lg:border-l lg:border-t-0">
          <div className="shrink-0 border-b border-[color:var(--lv-border)] px-4 py-3 font-semibold">Live chat</div>
          {session.promo?.slug && session.promo.is_open !== false && !session.promo.expired ? (
            <a
              href={liveDealPath(session.merchant?.slug, session.promo.slug) || "#"}
              className="mx-3 mt-3 block shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 hover:bg-amber-400/15"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-300">
                Tonight’s deals
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold">
                {session.promo.title || "Open the deal page"} →
              </p>
            </a>
          ) : null}
          {pinned ? (
            <div className="mx-3 mt-3 shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-300">
                Pinned
              </p>
              <p className="mt-0.5 text-xs font-semibold">
                {pinned.sender_name || "Store"} · {pinned.body}
              </p>
            </div>
          ) : null}
          <div ref={chatBox} className="thin min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm">
            {messages.length === 0 ? (
              <p className="pt-4 text-center text-[var(--lv-muted)]">The room is quiet. Say hello.</p>
            ) : null}
            {messages.map((m) => {
              const code = (m.payload as { coupon?: { code?: string } })?.coupon?.code;
              const merchant = m.sender_type === "merchant" || m.sender_type === "system";
              const isOrder = m.kind === "order";
              const mine = m.sender_type === "customer" && !merchant && !isOrder;
              return (
                <div
                  key={m.id}
                  className={`flex ${merchant && !isOrder ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                      isOrder
                        ? isDark
                          ? "w-full rounded-xl bg-amber-400/15 text-amber-100"
                          : "w-full rounded-xl bg-amber-100 text-amber-950"
                        : merchant
                          ? isDark
                            ? "rounded-br-md bg-fuchsia-600/25 text-[#f5e9ff]"
                            : "rounded-br-md bg-fuchsia-100 text-fuchsia-950"
                          : mine
                            ? isDark
                              ? "rounded-bl-md bg-sky-500/20 text-sky-50"
                              : "rounded-bl-md bg-sky-100 text-sky-950"
                            : isDark
                              ? "rounded-bl-md bg-white/10 text-[#e7e9ee]"
                              : "rounded-bl-md bg-slate-200 text-slate-900"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        merchant ? "text-fuchsia-200" : "text-sky-300"
                      }`}
                    >
                      {m.sender_name || "Shopper"}
                    </p>
                    <p className={`mt-0.5 break-words ${m.kind === "reaction" ? "text-lg" : ""}`}>
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
                    {m.kind === "coupon" && code ? (
                      <button
                        type="button"
                        className="mt-1 text-xs font-extrabold text-amber-300"
                        onClick={() => onCoupon(String(code))}
                      >
                        Use {code}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 space-y-2 border-t border-[color:var(--lv-border)] bg-[var(--lv-bg)] p-3">
            <div className="flex flex-wrap gap-1">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => onSticker(sticker)}
                  className="rounded-lg px-1.5 text-xl hover:scale-125"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder={isAuthenticated ? "Say something…" : "Sign in to chat"}
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--lv-border)] bg-[var(--lv-input)] px-3 py-2 text-[var(--lv-fg)] outline-none focus:border-fuchsia-500"
              />
              <button
                type="button"
                onClick={onSend}
                className="rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold hover:bg-fuchsia-500"
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      </main>

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
          registerInterest={Boolean(featured.contact_merchant_only)}
          onRegisterInterest={async ({ fullName, phone, email }) => {
            const bits = [fullName, phone, email].filter(Boolean).join(" · ");
            await onChat?.(
              `Registering interest in ${featured.name}${bits ? ` — ${bits}` : "."}`
            );
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
