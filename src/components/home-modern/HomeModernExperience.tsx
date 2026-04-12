import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hook/useReduxTypes";
import OptimizedImage from "@/components/common/OptimizedImage";
import ProductCard from "@/components/product/ProductCard";
import ProductCard2 from "@/components/product/ProductCard2";
import { formatCurrency, featuredImageCardSrc } from "@/util";
import type { AdvertBanner, PopularCategory, ProductFull } from "@/types/home";

function dedupeCategories(cats: PopularCategory[] | undefined): PopularCategory[] {
  if (!cats?.length) return [];
  return cats.filter(
    (item, index, self) =>
      item.name && self.findIndex((i) => i.name === item.name) === index
  );
}

/* Product card star row — disabled while ratings are hidden on cards
function StarRow({ rating }: { rating: string }) {
  const n = Math.min(5, Math.max(0, Math.round(parseFloat(rating) || 0)));
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-orange" : "text-slate-200"}>
          ★
        </span>
      ))}
    </div>
  );
}
*/

function discountPct(price: string, discount: string): number | null {
  const p = parseFloat(price);
  const d = parseFloat(discount);
  if (!p || !d || d >= p) return null;
  return Math.round(((p - d) / p) * 100);
}

function ChevronLeft() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Split-screen hero: cinematic banner + editorial copy panel (distinct from classic stacked layout). */
function HeroEditorialSplit({
  banners,
  appName,
  slogan,
}: {
  banners: AdvertBanner[];
  appName: string;
  slogan: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 6500);
    return () => clearInterval(t);
  }, [banners.length]);
  const go = useCallback(
    (dir: -1 | 1) => setI((p) => (p + dir + banners.length) % banners.length),
    [banners.length]
  );

  const rightPanel = (
    <div className="relative flex flex-col justify-center border-t border-slate-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-[#eef3fb] px-8 py-12 sm:px-10 lg:border-l lg:border-t-0 lg:py-16 lg:pl-12 lg:pr-10">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-secondaryTextColor/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange/15 blur-2xl" />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.45em] text-secondaryTextColor">
        New storefront
      </p>
      <h1 className="relative mt-4 font-[family-name:Kanit] text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.02] tracking-tight text-headerBg">
        {appName}
        <span className="mt-1 block bg-gradient-to-r from-primary via-headerBg to-secondaryTextColor bg-clip-text text-transparent">
          built for discovery.
        </span>
      </h1>
      <p
        className="relative mt-5 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base"
        style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
      >
        {slogan}
      </p>
      <div className="relative mt-8 flex flex-wrap gap-3">
        <Link
          href="/categories"
          className="inline-flex items-center rounded-full bg-headerBg px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-primary"
        >
          Shop categories
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-headerBg transition hover:border-secondaryTextColor hover:text-secondaryTextColor"
        >
          Search
        </Link>
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 underline-offset-4 hover:text-primary hover:underline">
          Classic layout
        </Link>
      </div>
      <div className="relative mt-10 flex flex-wrap gap-6 border-t border-slate-200/60 pt-8 text-xs text-slate-500">
        <span className="font-semibold text-headerBg">Secure checkout</span>
        <span className="hidden sm:inline">·</span>
        <span>Curated merchants</span>
        <span className="hidden sm:inline">·</span>
        <span>Same inventory as classic home</span>
      </div>
    </div>
  );

  if (!banners.length) {
    return (
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-[1600px] lg:min-h-[min(72vh,760px)] lg:grid-cols-12">
          <div className="relative flex min-h-[280px] items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,rgba(91,198,148,0.12),transparent_50%),linear-gradient(135deg,#f8fafc,#eef4ff)] px-6 py-16 lg:col-span-7">
            <p className="max-w-md text-center text-slate-600">Promotions load here when available. Explore categories to start.</p>
          </div>
          <div className="lg:col-span-5">{rightPanel}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1600px] lg:min-h-[min(88vh,920px)] lg:grid-cols-12">
        <div className="relative min-h-[min(52vh,520px)] lg:col-span-7 lg:min-h-0">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-[1000ms] ease-out ${
                idx === i ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
            >
              <OptimizedImage
                src={banner.web_banner_image || banner.banner_image}
                alt=""
                width={1400}
                height={900}
                className="h-full w-full object-cover object-center"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:from-black/35" />
              {banner.url && (
                <a
                  href={banner.url}
                  className="absolute inset-0 z-[2]"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open promotion"
                />
              )}
            </div>
          ))}
          <div className="absolute bottom-6 left-6 right-6 z-[4] flex items-end justify-between gap-4 lg:left-8 lg:right-8">
            <div className="flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <span className="hidden rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-md sm:inline">
              Live offers
            </span>
          </div>
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 z-[4] hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-800 shadow-lg transition hover:bg-white md:left-5 lg:block"
                aria-label="Previous"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 z-[4] hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-800 shadow-lg transition hover:bg-white md:right-5 lg:block"
                aria-label="Next"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
        <div className="lg:col-span-5">{rightPanel}</div>
      </div>
    </section>
  );
}

function StickyJumpNav() {
  const links = [
    { href: "#spotlight", label: "Spotlight" },
    { href: "#categories", label: "Categories" },
    { href: "#rated", label: "Top rated" },
    { href: "#selling", label: "Best sellers" },
  ];
  return (
    <nav
      className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md motion-reduce:static"
      aria-label="Section navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 sm:py-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:bg-slate-100 hover:text-headerBg sm:text-[13px]"
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CategoryMarquee({ categories }: { categories: PopularCategory[] }) {
  if (!categories.length) return null;
  const doubled = [...categories, ...categories];
  return (
    <div className="border-y border-slate-200 bg-headerBg py-3 text-white motion-reduce:hidden">
      <div className="relative overflow-hidden">
        <div className="flex w-max motion-safe:animate-modern-marquee">
          {doubled.map((cat, idx) => (
            <span key={`${cat.id}-${idx}`} className="mx-6 flex items-center gap-2 text-sm font-medium text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-secondaryTextColor" />
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBand({
  categories,
  recommended,
  topRated,
}: {
  categories: number;
  recommended: number;
  topRated: number;
}) {
  const items = [
    { v: categories || "—", l: "Aisles" },
    { v: recommended || "—", l: "Picks" },
    { v: topRated || "—", l: "Rated 4★+" },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-secondaryTextColor via-emerald-500 to-teal-500 py-10 text-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-6 text-center sm:px-10">
        {items.map((it) => (
          <div key={it.l}>
            <p className="font-[family-name:Kanit] text-4xl font-bold sm:text-5xl">{it.v}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">{it.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditorialSpotlight({ product }: { product: ProductFull }) {
  const img = featuredImageCardSrc(product.featured_image?.[0]);
  const pct = discountPct(product.price, product.discount_price);
  return (
    <section id="spotlight" className="scroll-mt-24 border-b border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondaryTextColor">Editor&apos;s pick</p>
            <h2 className="mt-2 font-[family-name:Kanit] text-3xl font-bold text-headerBg sm:text-4xl">Start with a standout</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
            See more picks →
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          <Link
            href={`/product/${product.slug}`}
            className="group relative block overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl shadow-slate-300/40 lg:col-span-7"
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt=""
                className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:aspect-[5/4] lg:min-h-[420px] lg:aspect-auto lg:h-full"
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center text-slate-400">No image</div>
            )}
            {pct != null && (
              <span className="absolute left-5 top-5 rounded-full bg-deepOrange px-3 py-1 text-xs font-bold text-white shadow-md">
                −{pct}%
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 opacity-0 transition group-hover:opacity-100 lg:opacity-100">
              <p className="text-sm font-semibold text-white/90">View product</p>
              <p className="text-lg font-bold text-white">{product.name}</p>
            </div>
          </Link>
          <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-8 shadow-lg lg:col-span-5 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textPadded">{product.merchant?.store_name}</p>
              <h3 className="mt-3 font-[family-name:Kanit] text-2xl font-bold leading-tight text-headerBg sm:text-3xl">{product.name}</h3>
              {/* Ratings hidden on product cards
              <div className="mt-4 flex items-center gap-3">
                <StarRow rating={product.rating} />
                <span className="text-xs text-slate-500">({product.numReviews ?? 0} reviews)</span>
              </div>
              */}
              <div className="mt-8 flex flex-wrap items-baseline gap-3">
                <span className="font-[family-name:Kanit] text-3xl font-bold text-headerBg">
                  {formatCurrency(product.discount_price || product.price)}
                </span>
                {product.discount_price && (
                  <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>
                )}
              </div>
            </div>
            <Link
              href={`/product/${product.slug}`}
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-secondaryTextColor py-4 text-center text-sm font-bold text-white transition hover:brightness-105 sm:w-auto sm:px-12"
            >
              Add to cart flow →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoRecommended({ products }: { products: ProductFull[] }) {
  const rest = products.slice(1, 8);
  if (!rest.length) return null;
  return (
    <section className="bg-[#f4f6fb] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <h3 className="font-[family-name:Kanit] text-2xl font-bold text-headerBg sm:text-3xl">More recommended</h3>
        <p className="mt-2 max-w-lg text-sm text-slate-600">A tighter grid with hover depth—same products as classic home, different rhythm.</p>
        <div className="mt-10 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {rest.map((product, key) => (
            <div
              key={product.id ?? key}
              className="rounded-2xl border border-slate-200/80 bg-white p-1 shadow-md transition duration-300 hover:-translate-y-1 hover:border-secondaryTextColor/40 hover:shadow-xl"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategorySnapStrip({ categories }: { categories: PopularCategory[] }) {
  if (!categories.length) return null;
  return (
    <section id="categories" className="scroll-mt-24 border-b border-slate-200 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-[family-name:Kanit] text-3xl font-bold text-headerBg">Browse by aisle</h2>
          <Link href="/categories" className="shrink-0 text-sm font-bold text-secondaryTextColor hover:underline">
            All categories
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.slice(0, 16).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories?type=cat&slug=${encodeURIComponent(cat.slug)}`}
                className="snap-start shrink-0 w-[132px] sm:w-[148px]"
              >
                <div className="flex flex-col items-center rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-5 transition hover:border-secondaryTextColor hover:bg-white hover:shadow-lg">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cat.icon} alt="" className="h-14 w-14 object-contain" />
                  </div>
                  <p className="mt-4 text-center text-[13px] font-bold leading-snug text-headerBg line-clamp-2">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdShowcase({ banners, label, variant }: { banners: AdvertBanner[]; label?: string; variant: "a" | "b" }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);
  if (!banners.length) return null;
  const b = banners[i];
  return (
    <section className={`py-12 sm:py-16 ${variant === "a" ? "bg-slate-50" : "bg-white"}`}>
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {label && (
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">{label}</p>
        )}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
          <div className="relative aspect-[16/7] min-h-[200px] w-full sm:aspect-[21/8]">
            <OptimizedImage src={b.web_image || b.image} alt="" width={1600} height={420} className="h-full w-full object-cover" />
            {b.url && <a href={b.url} className="absolute inset-0 z-10" target="_blank" rel="noopener noreferrer" />}
          </div>
          {banners.length > 1 && (
            <div className="flex justify-center gap-1.5 border-t border-slate-100 py-4">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-headerBg" : "w-2 bg-slate-200"}`}
                  aria-label={`Ad ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TopRatedBento({
  products,
  bestSelling,
}: {
  products: ProductFull[];
  bestSelling: ProductFull[];
}) {
  const [a, b, c, d] = products;
  const cells = [a, b, c, d].filter(Boolean) as ProductFull[];
  if (!cells.length && !bestSelling.length) return null;
  return (
    <section id="rated" className="scroll-mt-24 bg-gradient-to-b from-white via-[#f7f9fc] to-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondaryTextColor">Social proof</p>
            <h2 className="mt-2 font-[family-name:Kanit] text-3xl font-bold text-headerBg sm:text-4xl">Top rated picks</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">Asymmetric grid: hero tile + companions—feels editorial, not catalog-default.</p>
            {cells.length > 0 && (
              <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
                {cells[0] && (
                  <div className="lg:col-span-6 lg:row-span-2">
                    <div className="h-full min-h-[200px] rounded-[1.75rem] border border-slate-200 bg-white p-1 shadow-lg transition hover:shadow-xl lg:min-h-[380px]">
                      <ProductCard product={cells[0]} />
                    </div>
                  </div>
                )}
                {cells[1] && (
                  <div className="lg:col-span-3">
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-1 shadow-md">
                      <ProductCard product={cells[1]} />
                    </div>
                  </div>
                )}
                {cells[2] && (
                  <div className="lg:col-span-3">
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-1 shadow-md">
                      <ProductCard product={cells[2]} />
                    </div>
                  </div>
                )}
                {cells[3] && (
                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-md">
                      <ProductCard product={cells[3]} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div id="selling" className="scroll-mt-24 lg:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-[1.75rem] border-2 border-slate-900/5 bg-white shadow-2xl">
              <div className="bg-gradient-to-br from-headerBg to-primary px-6 py-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Velocity</p>
                <h3 className="mt-1 font-[family-name:Kanit] text-2xl font-bold">Best sellers</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {bestSelling.slice(0, 4).map((item, key) => (
                  <div key={item.id ?? key} className="relative bg-white">
                    <span className="absolute left-3 top-1/2 z-[1] -translate-y-1/2 font-[family-name:Kanit] text-3xl font-bold text-slate-100">
                      {String(key + 1).padStart(2, "0")}
                    </span>
                    <ProductCard2 product={bestSelling} index={key} item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopSellingStrip({ products }: { products: ProductFull[] }) {
  if (!products.length) return null;
  return (
    <section className="border-t border-slate-200 bg-headerBg py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondaryTextColor">Trending</p>
            <h2 className="mt-2 font-[family-name:Kanit] text-3xl font-bold sm:text-4xl">Top selling now</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-white/90 underline-offset-4 hover:text-secondaryTextColor hover:underline">
            Search the catalog →
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product, key) => (
            <div
              key={product.id ?? key}
              className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm transition hover:bg-white/10"
            >
              <div className="overflow-hidden rounded-[1.25rem] bg-white">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST_ITEMS = [
  { icon: "/imgs/page/product/delivery.svg", title: "Fast delivery", sub: "On qualifying orders" },
  { icon: "/imgs/page/product/support.svg", title: "Real support", sub: "Help when you need it" },
  { icon: "/assets/voucher.svg", title: "Rewards", sub: "Deals & vouchers" },
  { icon: "/imgs/page/product/payment.svg", title: "Secure pay", sub: "Protected checkout" },
];

function TrustPulse() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <h3 className="text-center font-[family-name:Kanit] text-2xl font-bold text-headerBg sm:text-3xl">Why shoppers stay</h3>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-600">
          The same policies as our classic storefront—presented for first-time visitors.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-8 text-center transition hover:-translate-y-0.5 hover:border-secondaryTextColor/30 hover:bg-white hover:shadow-lg motion-reduce:transform-none"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100 transition group-hover:ring-secondaryTextColor/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.icon} alt="" width={28} height={28} className="opacity-90" />
              </div>
              <h4 className="mt-5 font-[family-name:Kanit] text-lg font-bold text-headerBg">{f.title}</h4>
              <p className="mt-1 text-xs text-slate-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-headerBg to-primary py-14 text-center text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,rgba(91,198,148,0.5),transparent_45%)]" />
      <div className="relative mx-auto max-w-2xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/70">Ready?</p>
        <h3 className="mt-3 font-[family-name:Kanit] text-2xl font-bold sm:text-3xl">Find your next favorite in seconds.</h3>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/categories" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-headerBg shadow-lg transition hover:bg-secondaryTextColor hover:text-white">
            Browse categories
          </Link>
          <Link
            href="/search"
            className="rounded-full border-2 border-white/40 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Open search
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomeModernExperience() {
  const { homePage, siteSettings } = useAppSelector((s) => s.general);

  const banners = useMemo(
    () => (homePage?.data?.banners as unknown as AdvertBanner[] | undefined) ?? [],
    [homePage?.data?.banners]
  );
  const categories = useMemo(
    () => dedupeCategories(homePage?.data?.popular_categories),
    [homePage?.data?.popular_categories]
  );
  const recommended = (homePage?.data?.recommended_products ?? []) as ProductFull[];
  const topRated = (homePage?.data?.top_rated_products ?? []) as ProductFull[];
  const topSelling = (homePage?.data?.top_selling_products ?? []) as ProductFull[];
  const bestSelling = (homePage?.data?.best_selling_products ?? []) as ProductFull[];
  const advertTop = (homePage?.data?.advert_banner ?? []) as AdvertBanner[];
  const advertMid = (homePage?.data?.advert_banner_middle ?? []) as AdvertBanner[];

  const appName = siteSettings?.app_name ?? "Hawola";
  const slogan = siteSettings?.app_slogan ?? "Everything you need, at better prices";

  return (
    <main className="bg-white text-slate-800">
      <HeroEditorialSplit banners={banners} appName={appName} slogan={slogan} />
      <StickyJumpNav />
      <CategoryMarquee categories={categories} />
      <StatsBand categories={categories.length} recommended={recommended.length} topRated={topRated.length} />

      {recommended[0] && (
        <>
          <EditorialSpotlight product={recommended[0]} />
          <BentoRecommended products={recommended} />
        </>
      )}

      <CategorySnapStrip categories={categories} />
      <AdShowcase banners={advertTop} label="Featured partners" variant="a" />
      <TopRatedBento products={topRated} bestSelling={bestSelling} />
      <AdShowcase banners={advertMid} label="In the spotlight" variant="b" />
      <TopSellingStrip products={topSelling} />
      <TrustPulse />
      <BottomCTA />
    </main>
  );
}
