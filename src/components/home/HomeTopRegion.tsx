import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAppSelector } from "@/hook/useReduxTypes";
import OptimizedImage from "@/components/common/OptimizedImage";
import Category from "@/components/category/Category";
import type { AdvertBanner, Banner, HeroCreativeSlide } from "@/types/home";

/** Stable empty refs so `?? []` does not allocate a new array every render. */
const EMPTY_BANNERS: Banner[] = [];
const EMPTY_ADVERTS: AdvertBanner[] = [];

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

function AdvertRail({ adverts }: { adverts: AdvertBanner[] }) {
  const slides = adverts.map(advertToSlide).filter((s) => s.image);
  if (!slides.length) return null;
  return (
    <div className="hidden xl:block w-full p-2 rounded-xl border-2 border-solid border-[#fe9636]">
      <Swiper direction="vertical" spaceBetween={8} slidesPerView={5} freeMode mousewheel modules={[Mousewheel]} className="h-[320px] md:h-[380px] w-full">
        {slides.map((slide) => (
          <SwiperSlide key={slide.key} className="!h-auto">
            <div className="relative rounded-lg overflow-hidden bg-slate-50 h-[120px] w-full">
              <OptimizedImage src={slide.image} alt="" width={400} height={200} className="w-full h-full object-contain" />
              <SlideLink slide={slide} className="absolute inset-0 z-10" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/**
 * Storefront home top: classic carousel (home banners only) + optional advert rail + categories.
 * Masonry/showcase and random layout switching are disabled until revisited.
 */
export default function HomeTopRegion() {
  const { homePage } = useAppSelector((state) => state.general);
  const banners = (homePage?.data?.banners ?? EMPTY_BANNERS) as Banner[];
  const heroAdverts = (homePage?.data?.hero_adverts ?? EMPTY_ADVERTS) as AdvertBanner[];

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
            <div className="xl:col-span-3 flex flex-col w-full">
              <AdvertRail adverts={heroAdverts} />
            </div>
          </div>
        </section>
      )}
      <Category />
    </>
  );
}
