import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hook/useReduxTypes";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { AdvertBanner, Banner, HeroCreativeSlide } from "@/types/home";

/** Stable empty refs so `?? []` does not allocate a new array every render. */
const EMPTY_BANNERS: Banner[] = [];

function isExternalHref(href: string | null): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}

function bannerImageSrc(b: Banner): string {
  const w = b.web_banner_image as string | undefined;
  const m = b.mobile_banner_image as string | undefined;
  const legacy = b.banner_image as string | undefined;
  return (w || m || legacy || "") as string;
}

function bannerToSlide(b: Banner): HeroCreativeSlide {
  const href =
    b.url && String(b.url).trim()
      ? String(b.url).trim()
      : b.product?.slug
        ? `/product/${b.product.slug}`
        : null;
  return {
    key: `banner-${b.id}`,
    image: bannerImageSrc(b),
    href,
    external: isExternalHref(href),
  };
}

function advertImageSrc(a: AdvertBanner): string {
  return (a.web_banner_image || a.web_image || a.image || a.banner_image || "") as string;
}

function advertToSlide(a: AdvertBanner): HeroCreativeSlide {
  let href: string | null = null;
  if (a.url && String(a.url).trim()) href = String(a.url).trim();
  else if (a.product?.slug) href = `/product/${a.product.slug}`;
  else if (a.merchant?.slug) href = `/merchants/${a.merchant.slug}`;
  return {
    key: `advert-${a.id}`,
    image: advertImageSrc(a),
    href,
    external: isExternalHref(href),
  };
}

function SlideLink({
  slide,
  className,
  children,
  ariaLabel = "Open promotion",
}: {
  slide: HeroCreativeSlide;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}) {
  if (!slide.href) return <>{children}</>;
  if (slide.external) {
    return (
      <a href={slide.href} className={className} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={slide.href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function AdvertSlotGrid({
  slots,
  columns,
  sectionClassName = "",
}: {
  slots: (AdvertBanner | null)[];
  columns: 2 | 3;
  sectionClassName?: string;
}) {
  const validSlots = slots.filter(Boolean) as AdvertBanner[];
  if (!validSlots.length) return null;
  const gridClass =
    columns === 3
      ? "grid grid-cols-1 gap-4 md:grid-cols-3"
      : "grid grid-cols-1 gap-4 md:grid-cols-2";
  return (
    <section className={`max-w-screen-xl mx-auto px-6 xl:px-0 ${sectionClassName}`}>
      <div className={gridClass}>
        {validSlots.map((slot) => {
          const slide = advertToSlide(slot);
          if (!slide?.image) return null;
          return (
            <div key={slide.key} className="relative overflow-hidden rounded-xl bg-slate-100 shadow-sm">
              <OptimizedImage
                src={slide.image}
                alt=""
                width={1200}
                height={280}
                className="h-32 w-full object-cover sm:h-40"
              />
              <SlideLink slide={slide} className="absolute inset-0 z-10" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HeroCarousel({ slides }: { slides: HeroCreativeSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay] = useState(true);

  const slideKeys = slides.map((s) => s.key).join("\0");
  useEffect(() => {
    setCurrentIndex(0);
  }, [slideKeys]);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="relative group h-full min-h-[200px] sm:min-h-[260px] md:min-h-[300px]">
      <div className="relative overflow-hidden rounded-xl w-full h-full min-h-[inherit]">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full min-h-[inherit]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.key} className="w-full flex-shrink-0 relative min-h-[inherit] bg-slate-100">
              <OptimizedImage
                src={slide.image}
                alt=""
                width={1200}
                height={400}
                className="w-full h-full min-h-[200px] sm:min-h-[260px] md:min-h-[300px] object-cover"
                priority={index === 0}
              />
              <SlideLink slide={slide} className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100 z-20"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100 z-20"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

/** Fixed ~297×156 slots beside hero (admin: Advert position Hero top / Hero bottom). */
function HeroSidebarHalves({ slots }: { slots: (AdvertBanner | null)[] }) {
  const top = slots[0] ?? null;
  const bottom = slots[1] ?? null;
  const topSlide = top ? advertToSlide(top) : null;
  const bottomSlide = bottom ? advertToSlide(bottom) : null;
  const hasAny = Boolean(topSlide?.image || bottomSlide?.image);

  return (
    <div
      className={`hidden xl:flex w-[297px] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-solid border-[#fe9636] bg-slate-50 dark:bg-gray-900/40 ${
        hasAny ? "" : "opacity-90"
      }`}
      style={{ height: 312 }}
    >
      {[topSlide, bottomSlide].map((slide, idx) => (
        <div
          key={idx}
          className="relative flex w-[297px] shrink-0 items-stretch justify-center bg-slate-100 dark:bg-gray-800/50"
          style={{ height: 156 }}
        >
          {slide?.image ? (
            <>
              <OptimizedImage
                src={slide.image}
                alt=""
                width={297}
                height={156}
                className="h-[156px] w-[297px] object-cover"
                priority={idx === 0}
              />
              <SlideLink slide={slide} className="absolute inset-0 z-10" ariaLabel={idx === 0 ? "Upper sidebar promo" : "Lower sidebar promo"} />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {idx === 0 ? "Hero top slot" : "Hero bottom slot"}
              </span>
              <span>Add an advert in Hawola Admin → Home Creator with position &quot;{idx === 0 ? "Hero top" : "Hero bottom"}&quot; (for home + active).</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Storefront home top: classic carousel (home banners only) + fixed hero sidebar ad halves + categories.
 * Masonry/showcase and random layout switching are disabled until revisited.
 */
export default function HomeTopRegion() {
  const { homePage } = useAppSelector((state) => state.general);
  const banners = (homePage?.data?.banners ?? EMPTY_BANNERS) as Banner[];
  const heroSidebarSlots = (homePage?.data?.hero_sidebar_slots ?? [
    null,
    null,
  ]) as (AdvertBanner | null)[];
  const topAdvertSlots = (homePage?.data?.advert_banner ?? []) as (AdvertBanner | null)[];

  const carouselSlides = useMemo(
    () => banners.map(bannerToSlide).filter((s) => s.image),
    [banners]
  );

  const hasHero = carouselSlides.length > 0;

  return (
    <>
      {hasHero && (
        <section className="max-w-screen-xl mx-auto py-4 px-6 xl:px-0">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-9 rounded-xl">
              <HeroCarousel slides={carouselSlides} />
            </div>
            <div className="xl:col-span-3 flex w-full flex-col items-end justify-stretch">
              <HeroSidebarHalves slots={heroSidebarSlots} />
            </div>
          </div>
        </section>
      )}
      {/* <Category /> */}
      <AdvertSlotGrid slots={topAdvertSlots} columns={3} sectionClassName="mb-6" />
    </>
  );
}
