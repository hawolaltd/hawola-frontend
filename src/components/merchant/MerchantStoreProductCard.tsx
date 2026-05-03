import Link from "next/link";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import type { Product } from "@/types/product";
import { capitalize, featuredImageCardUrl, formatCurrency } from "@/util";

const EMPTY_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%23f1f5f9' width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui,sans-serif' font-size='14'%3EPhoto%3C/text%3E%3C/svg%3E";

function salePercentOff(price: unknown, discountPrice: unknown): number | null {
  const p = parseFloat(String(price ?? ""));
  const d = parseFloat(String(discountPrice ?? ""));
  if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(d) || d <= 0 || d >= p) {
    return null;
  }
  return Math.round(((p - d) / p) * 100);
}

type Props = {
  product: Product;
};

/**
 * Storefront product tile for merchant Normal (and similar) templates —
 * mobile-first, touch-friendly, compares well to major marketplaces.
 */
export default function MerchantStoreProductCard({ product }: Props) {
  const slug = product?.slug?.trim();
  const href = slug ? `/product/${slug}` : "#";
  const img = featuredImageCardUrl(product?.featured_image?.[0], EMPTY_IMG);
  const name = product?.name?.trim() ? capitalize(product.name) : "Product";
  const list = String(product?.price ?? "").trim();
  const sale = String(product?.discount_price ?? "").trim();
  const hasSale = Boolean(sale && list && sale !== list);
  const displayPrice = hasSale ? sale : list;
  const pct = hasSale ? salePercentOff(product.price, product.discount_price) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-950/[0.03] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.12)] hover:ring-slate-300/70">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-slate-100">
        <Link href={href} className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900/30" aria-label={`View ${name}`}>
          <img
            src={img}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.onerror = null;
              el.src = EMPTY_IMG;
            }}
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-60" aria-hidden />
        <div className="absolute right-2 top-2 z-20 sm:right-2.5 sm:top-2.5">
          <AddToCompareButton
            variant="icon"
            product={product}
            className="[&_button]:h-9 [&_button]:w-9 [&_button]:rounded-xl [&_button]:border-white/80 [&_button]:bg-white/95 [&_button]:shadow-md"
          />
        </div>
        {pct != null && pct > 0 ? (
          <span className="absolute left-2 top-2 z-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md sm:left-2.5 sm:top-2.5">
            −{pct}%
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <Link href={href} className="min-h-0 focus:outline-none focus-visible:underline">
          <h3 className="line-clamp-2 text-left text-[0.9375rem] font-semibold leading-snug tracking-tight text-slate-900 sm:text-base">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg font-bold tabular-nums tracking-tight text-slate-900 sm:text-xl">
              {formatCurrency(displayPrice || "0")}
            </span>
            {hasSale && list ? (
              <span className="text-xs font-medium tabular-nums text-slate-400 line-through sm:text-sm">
                {formatCurrency(list)}
              </span>
            ) : null}
          </div>

          <Link
            href={href}
            className="merchant-button flex w-full items-center justify-center rounded-xl py-3 text-center text-sm font-semibold shadow-sm transition active:scale-[0.99] sm:py-3.5 sm:text-[0.9375rem]"
          >
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
