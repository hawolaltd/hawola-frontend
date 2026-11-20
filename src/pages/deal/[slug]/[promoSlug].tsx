import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import { liveDeal, type LiveProduct, type LivePromo } from "@/lib/hawolaLive";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { addToCarts } from "@/redux/product/productSlice";
import { useAppDispatch } from "@/hook/useReduxTypes";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function useCountdown(iso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (!iso) return { label: "", ended: true };
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0) return { label: "Ended", ended: true };
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return { label: `${pad(h)}:${pad(m)}:${pad(sec)}`, ended: false };
  }, [iso, now]);
}

function sellingPrice(p: LiveProduct) {
  return Number(p.deal_price || p.effective_price || p.discount_price || p.price || 0);
}

function listPrice(p: LiveProduct) {
  return Number(p.price || 0);
}

function ProductCard({
  product,
  featured,
  expired,
  onBuy,
}: {
  product: LiveProduct;
  featured?: boolean;
  expired: boolean;
  onBuy: (id: number) => void;
}) {
  const sell = sellingPrice(product);
  const list = listPrice(product);
  const off = list > sell && sell > 0;
  const contact = Boolean(product.contact_merchant_only);
  return (
    <article
      className={`group overflow-hidden border border-white/10 bg-white/[0.04] ${
        featured ? "rounded-[28px]" : "rounded-3xl"
      }`}
    >
      <div className={`relative overflow-hidden bg-black ${featured ? "aspect-[4/5] sm:aspect-[16/10]" : "aspect-[4/5]"}`}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/30">No photo</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        {off && !expired ? (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
            Live deal
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className={`font-black text-white ${featured ? "text-2xl sm:text-3xl" : "text-base"}`}>
            {product.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <p className={`font-black text-amber-300 ${featured ? "text-3xl" : "text-xl"}`}>{naira(sell)}</p>
            {off ? <p className="text-sm text-white/50 line-through">{naira(list)}</p> : null}
          </div>
          <button
            type="button"
            className={`mt-3 w-full rounded-full py-2.5 text-sm font-extrabold ${
              contact ? "bg-white text-zinc-950" : "bg-red-600 text-white hover:bg-red-500"
            }`}
            onClick={() => onBuy(product.id)}
          >
            {contact ? "Register interest" : expired ? "Add to cart" : "Grab this"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HawolaLiveDealPage() {
  const router = useRouter();
  const merchantSlug = String(router.query.slug || "");
  const slug = String(router.query.promoSlug || "");
  const dispatch = useAppDispatch();
  const [promo, setPromo] = useState<LivePromo | null>(null);
  const [missing, setMissing] = useState(false);
  const countdown = useCountdown(promo?.expires_at || null);

  useEffect(() => {
    if (!slug || !merchantSlug) return;
    liveDeal(slug, merchantSlug)
      .then(setPromo)
      .catch(() => setMissing(true));
  }, [slug, merchantSlug]);

  const buy = async (productId: number) => {
    const product = promo?.products?.find((p) => p.id === productId);
    if (product?.contact_merchant_only && promo?.store?.slug) {
      window.location.href = `/live/${promo.store.slug}`;
      return;
    }
    try {
      await dispatch(addToCarts({ items: [{ qty: 1, product: productId }] }) as never);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart.");
    }
  };

  const template = promo?.template || "collection";
  const products = promo?.products || [];
  const expired = Boolean(promo?.expired) || countdown.ended;
  const liveHref = promo?.store?.slug ? `/live/${promo.store.slug}` : "";
  const storeHref = promo?.store?.slug ? `/${promo.store.slug}` : "";
  const hero = products[0];
  const rest = products.slice(1);

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      <Header />
      <main>
        {missing ? (
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-red-500">Hawola Live</p>
            <h1 className="mt-3 text-3xl font-black">This deal page is gone</h1>
            <p className="mt-2 text-sm text-white/55">The timed sale closed or the link is no longer valid.</p>
          </div>
        ) : !promo ? (
          <p className="px-4 py-24 text-center text-sm text-white/45">Loading tonight’s deals…</p>
        ) : (
          <>
            <section className="relative overflow-hidden border-b border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.28),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.16),_transparent_50%)]" />
              <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-14">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-red-400">
                    {expired ? "Live sale ended" : "Tonight only"}
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{promo.title}</h1>
                  <p className="mt-3 text-sm text-white/60">
                    {promo.store?.store_name
                      ? `From ${promo.store.store_name} on Hawola Live.`
                      : "A timed drop from a Hawola live sale."}{" "}
                    {expired
                      ? "The clock is done — you can still shop the store."
                      : "Prices on this page hold until the clock hits zero."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {liveHref && !expired ? (
                      <Link
                        href={liveHref}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-extrabold hover:bg-red-500"
                      >
                        Watch the live
                      </Link>
                    ) : null}
                    {storeHref ? (
                      <Link
                        href={storeHref}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
                      >
                        {expired ? "Open store" : "Visit store"}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="w-full max-w-xs rounded-3xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/45">
                    {expired ? "Status" : "Time left"}
                  </p>
                  <p className={`mt-1 font-black tabular-nums ${expired ? "text-xl text-white/50" : "text-4xl text-amber-300"}`}>
                    {countdown.label || "—"}
                  </p>
                  {promo.coupons?.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {promo.coupons.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            savePendingCouponCode(c.code, { code: c.code });
                            toast.success(`Saved ${c.code} for checkout`);
                          }}
                          className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-zinc-950"
                        >
                          Use {c.code}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              {products.length === 0 ? (
                <p className="text-sm text-white/50">No products on this deal page yet.</p>
              ) : template === "spotlight" && hero ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)]">
                  <ProductCard product={hero} featured expired={expired} onBuy={buy} />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {rest.map((p) => (
                      <ProductCard key={p.id} product={p} expired={expired} onBuy={buy} />
                    ))}
                  </div>
                </div>
              ) : template === "runway" ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {products.map((p, i) => (
                    <div key={p.id} className={`shrink-0 ${i === 0 ? "w-[78vw] max-w-md" : "w-64"}`}>
                      <ProductCard product={p} featured={i === 0} expired={expired} onBuy={buy} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} expired={expired} onBuy={buy} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
