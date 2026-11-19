import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import { liveDeal, type LivePromo } from "@/lib/hawolaLive";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { addToCarts } from "@/redux/product/productSlice";
import { useAppDispatch } from "@/hook/useReduxTypes";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function useCountdown(iso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (!iso) return "";
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0) return "Ended";
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s left`;
  }, [iso, now]);
}

export default function HawolaLiveDealPage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const dispatch = useAppDispatch();
  const [promo, setPromo] = useState<LivePromo | null>(null);
  const [missing, setMissing] = useState(false);
  const countdown = useCountdown(promo?.expires_at || null);

  useEffect(() => {
    if (!slug) return;
    liveDeal(slug)
      .then(setPromo)
      .catch(() => setMissing(true));
  }, [slug]);

  const buy = async (productId: number) => {
    try {
      await dispatch(addToCarts({ items: [{ qty: 1, product: productId }] }) as never);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart.");
    }
  };

  const template = promo?.template || "collection";
  const products = promo?.products || [];
  const expired = Boolean(promo?.expired) || countdown === "Ended";

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {missing ? (
          <div className="rounded-3xl border p-8 text-center">
            <h1 className="text-2xl font-black">This live sale page is gone</h1>
          </div>
        ) : !promo ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Live sale</p>
            <h1 className="mt-2 text-4xl font-black">{promo.title}</h1>
            <p className={`mt-2 text-sm font-semibold ${expired ? "text-slate-500" : "text-red-600"}`}>
              {countdown}
            </p>
            {promo.store?.slug ? (
              <Link href={expired ? `/${promo.store.slug}` : `/live/${promo.store.slug}`} className="mt-2 inline-block text-sm font-semibold text-brand-600">
                {expired ? "This live sale ended. Open store" : "Watch the live"}
              </Link>
            ) : null}
            {promo.coupons?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {promo.coupons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      savePendingCouponCode(c.code, { code: c.code });
                      toast.success(`Saved ${c.code}`);
                    }}
                    className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-950"
                  >
                    Use {c.code}
                  </button>
                ))}
              </div>
            ) : null}
            {expired ? (
              <p className="mt-8 text-slate-600">The countdown is over. Products below may still be in the store.</p>
            ) : null}
            <div
              className={
                template === "spotlight"
                  ? "mt-8 grid gap-6"
                  : template === "runway"
                    ? "mt-8 flex gap-4 overflow-x-auto pb-2"
                    : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {products.map((p) => (
                <article
                  key={p.id}
                  className={`overflow-hidden rounded-3xl border border-slate-200 bg-white ${
                    template === "spotlight" ? "mx-auto max-w-xl" : template === "runway" ? "w-56 shrink-0" : ""
                  }`}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-52 w-full object-cover" />
                  ) : null}
                  <div className="p-4">
                    <h2 className="font-bold">{p.name}</h2>
                    <p className="mt-1 text-lg font-black">₦{Number(p.effective_price || 0).toLocaleString()}</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-full bg-slate-900 py-2 text-sm font-bold text-white"
                      onClick={() => void buy(p.id)}
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
