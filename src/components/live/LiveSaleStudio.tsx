import LivePlayer from "@/components/live/LivePlayer";
import InstantOrderModal from "@/components/product/InstantOrderModal";
import type { LiveMessage, LiveProduct, LiveSession } from "@/lib/hawolaLive";
import type { OrderDetailsResponse } from "@/types/product";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function ProductCard({
  product,
  featured,
  accent,
  onOpen,
}: {
  product: LiveProduct;
  featured?: boolean;
  accent: string;
  onOpen: (product: LiveProduct) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className={`flex shrink-0 gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 text-left ${
        featured ? "min-w-[16.5rem] sm:min-w-[20rem]" : "w-52"
      }`}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className={`rounded-xl object-cover ${featured ? "h-[4.5rem] w-[4.5rem]" : "h-16 w-16"}`}
        />
      ) : (
        <div className={`rounded-xl bg-slate-100 ${featured ? "h-[4.5rem] w-[4.5rem]" : "h-16 w-16"}`} />
      )}
      <div className="min-w-0 flex-1">
        {featured ? (
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-600">
            Selling now
          </p>
        ) : null}
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{product.name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm font-black text-slate-900">{naira(product.effective_price)}</p>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
            style={{ backgroundColor: accent }}
          >
            Order
          </span>
        </div>
      </div>
    </button>
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
  onLike,
  onCoupon,
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
  onLike: () => void;
  onCoupon: (code: string) => void;
  userEmail?: string | null;
  userPhone?: string | null;
}) {
  const chatBox = useRef<HTMLDivElement | null>(null);
  const [picked, setPicked] = useState<LiveProduct | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const products = session.products || [];
  const featured = products[0];
  const rest = products.slice(1);
  const accent = session.merchant?.primary_color || "#dc2626";
  const store = session.merchant;
  const title = session.title || store?.store_name || "Live sale";

  useEffect(() => {
    const box = chatBox.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages.length]);

  const productDock = (
    <div className="border-t border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-600">
          Grab it while it’s live
        </p>
        {session.promo?.slug ? (
          <Link href={`/deal/${session.promo.slug}`} className="text-[11px] font-bold text-amber-700">
            Full deal page
          </Link>
        ) : null}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-0.5">
        {featured ? (
          <ProductCard product={featured} featured accent={accent} onOpen={setPicked} />
        ) : (
          <p className="text-sm text-slate-500">The store will pin products here as they sell.</p>
        )}
        {rest.map((p) => (
          <ProductCard key={p.id} product={p} accent={accent} onOpen={setPicked} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-screen-xl px-6 py-3 xl:px-0">
      <div className="flex h-[calc(100svh-9.5rem)] min-h-[24rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm sm:h-[calc(100svh-12rem)] lg:h-[calc(100svh-15.5rem)]">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <Link href={`/${store.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
            {store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logo}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-red-500/70"
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ backgroundColor: accent }}
              >
                {(store.store_name || "S").slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
                <p className="truncate text-sm font-bold">{store.store_name}</p>
              </div>
              <p className="truncate text-xs text-slate-500">
                {title} · {session.viewer_count || 0} watching
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onLike}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              liked ? "bg-red-600 text-white" : "bg-slate-100 text-slate-800"
            }`}
          >
            ♥ {likes}
          </button>
          <Link
            href={`/${store.slug}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Visit store
          </Link>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(8rem,1fr)_auto_minmax(13rem,0.95fr)] lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)] lg:grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative min-h-0 bg-black lg:col-start-1 lg:row-start-1">
            <LivePlayer embedUrl={session.embed_url} title={title} fill />
          </div>

          <aside className="flex min-h-0 flex-col border-t border-slate-200 bg-white max-lg:row-start-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <p className="text-sm font-bold">Live chat</p>
              <p className="text-[11px] text-slate-400">Ask. Offer. Buy.</p>
            </div>
            <div ref={chatBox} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
              {messages.length === 0 ? (
                <p className="px-2 pt-4 text-center text-sm text-slate-400">
                  The room is quiet. Say hello or ask about what’s on the table.
                </p>
              ) : null}
              {messages.map((m) => {
                const code = (m.payload as { coupon?: { code?: string } })?.coupon?.code;
                const merchant = m.sender_type === "merchant" || m.sender_type === "system";
                const isOrder = m.kind === "order";
                return (
                  <div
                    key={m.id}
                    className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
                      isOrder
                        ? "bg-amber-50 text-amber-950"
                        : merchant
                          ? "ml-auto bg-red-50 text-slate-900"
                          : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {m.sender_name || "Shopper"}
                    </p>
                    <p className="mt-0.5">{m.body}</p>
                    {m.kind === "coupon" && code ? (
                      <button
                        type="button"
                        className="mt-1 text-xs font-extrabold text-amber-700"
                        onClick={() => onCoupon(String(code))}
                      >
                        Use {code}
                      </button>
                    ) : null}
                  </div>
                );
              })}
              </div>
            <div className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white p-3">
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                  placeholder={isAuthenticated ? "Ask or say you’re buying…" : "Sign in to chat"}
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500/70"
                />
                <button
                  type="button"
                  onClick={onSend}
                  className="rounded-full bg-red-600 px-4 text-sm font-extrabold text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </aside>

          <div className="max-lg:row-start-2 lg:col-start-1 lg:row-start-2">{productDock}</div>
        </div>
      </div>

      {picked ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close product"
            onClick={() => {
              setPicked(null);
              setOrderOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            {picked.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={picked.image} alt={picked.name} className="h-52 w-full object-cover" />
            ) : (
              <div className="h-40 bg-slate-100" />
            )}
            <div className="p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                On this live
              </p>
              <h2 className="mt-1 text-xl font-black">{picked.name}</h2>
              <p className="mt-1 text-lg font-black">{naira(picked.effective_price)}</p>
              {picked.description ? (
                <p className="mt-2 line-clamp-4 text-sm text-slate-500">{picked.description}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-full py-2.5 text-sm font-extrabold text-white"
                  style={{ backgroundColor: accent }}
                  onClick={() => setOrderOpen(true)}
                >
                  Order now
                </button>
                {picked.slug ? (
                  <Link
                    href={`/product/${picked.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    View product
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {picked ? (
        <InstantOrderModal
          isOpen={orderOpen}
          onClose={() => setOrderOpen(false)}
          productId={picked.id}
          productName={picked.name}
          unitPrice={Number(picked.effective_price || picked.price || 0)}
          merchantId={store.id}
          qty={1}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userPhone={userPhone}
          liveSessionId={session.id}
          onOrderPlaced={(order: OrderDetailsResponse) => {
            setOrderOpen(false);
            setPicked(null);
            toast.success(order?.id ? "Order placed from this live." : "Order placed.");
          }}
        />
      ) : null}
    </div>
  );
}
