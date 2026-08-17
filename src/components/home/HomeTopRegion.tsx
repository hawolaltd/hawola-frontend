"use client";

import React, { useMemo } from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { AdvertBanner, Banner, HeroCreativeSlide } from "@/types/home";
import AppStoreBadges from "./hero/AppStoreBadges";
import HeroCarousel from "./hero/HeroCarousel";
import { advertToSlide, bannerToSlide, SlideLink } from "./hero/heroSlides";
import { parseHomepageHeroTheme, type HomepageHeroTheme } from "./hero/heroTheme";

const EMPTY_BANNERS: Banner[] = [];

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
    <section className={`mx-auto max-w-screen-xl px-6 xl:px-0 ${sectionClassName}`}>
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

/** Fixed ~297×156 slots beside / over hero (admin: Advert position Hero top / Hero bottom). */
function HeroSidebarHalves({
  slots,
  className = "",
}: {
  slots: (AdvertBanner | null)[];
  className?: string;
}) {
  const top = slots[0] ?? null;
  const bottom = slots[1] ?? null;
  const topSlide = top ? advertToSlide(top) : null;
  const bottomSlide = bottom ? advertToSlide(bottom) : null;
  const hasAny = Boolean(topSlide?.image || bottomSlide?.image);

  return (
    <div
      className={`hidden w-[297px] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-solid border-[#fe9636] bg-slate-50 xl:flex ${
        hasAny ? "" : "opacity-90"
      } ${className}`}
      style={{ height: 312 }}
    >
      {[topSlide, bottomSlide].map((slide, idx) => (
        <div
          key={idx}
          className="relative flex w-[297px] shrink-0 items-stretch justify-center bg-slate-100"
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
              <SlideLink
                slide={slide}
                className="absolute inset-0 z-10"
                ariaLabel={idx === 0 ? "Upper sidebar promo" : "Lower sidebar promo"}
              />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">
                {idx === 0 ? "Hero top slot" : "Hero bottom slot"}
              </span>
              <span>
                Add an advert in Hawola Admin → Home Creator with position &quot;
                {idx === 0 ? "Hero top" : "Hero bottom"}&quot; (for home + active).
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PromoTile({ slide, className = "" }: { slide: HeroCreativeSlide; className?: string }) {
  if (!slide.image) return null;
  return (
    <div className={`group relative overflow-hidden bg-slate-100 ${className}`}>
      <OptimizedImage
        src={slide.image}
        alt=""
        width={800}
        height={400}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
      <SlideLink slide={slide} className="absolute inset-0 z-10" />
    </div>
  );
}

type ThemeProps = {
  carouselSlides: HeroCreativeSlide[];
  sideSlides: HeroCreativeSlide[];
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
  heroSidebarSlots: (AdvertBanner | null)[];
};

function BoxedMarketplaceTheme({ carouselSlides, heroSidebarSlots }: ThemeProps) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-4 xl:px-0">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-xl xl:col-span-9">
          <HeroCarousel
            slides={carouselSlides}
            objectFit="contain"
            imageClassName="md:object-cover"
            showDots
          />
        </div>
        <div className="flex w-full flex-col items-end justify-stretch xl:col-span-3">
          <HeroSidebarHalves slots={heroSidebarSlots} />
        </div>
      </div>
    </section>
  );
}

function CinemaWideTheme({
  carouselSlides,
  playStoreUrl,
  appStoreUrl,
  heroSidebarSlots,
}: ThemeProps) {
  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden bg-[#0f172a]">
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-40"
          style={{
            background:
              "radial-gradient(1200px 420px at 20% 10%, rgba(254,150,54,0.28), transparent 55%), radial-gradient(900px 360px at 85% 90%, rgba(14,165,233,0.18), transparent 50%)",
          }}
        />
        <div className="relative z-[1]">
          <HeroCarousel
            slides={carouselSlides}
            frameClassName="min-h-[42vw] max-h-[520px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[440px]"
            roundedClassName="rounded-none"
            objectFit="cover"
            showDots
            showArrows
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        </div>

        {/* Side promos float over the full-bleed banner on wide screens */}
        <div className="pointer-events-none absolute inset-0 z-30 hidden xl:block">
          <div className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 2xl:right-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
            <div className="shadow-[0_18px_50px_-20px_rgba(0,0,0,0.65)]">
              <HeroSidebarHalves slots={heroSidebarSlots} />
            </div>
          </div>
        </div>
      </div>
      <AppStoreBadges playStoreUrl={playStoreUrl} appStoreUrl={appStoreUrl} variant="strip" />
    </section>
  );
}

function EditorialSplitTheme({ carouselSlides, sideSlides, playStoreUrl, appStoreUrl }: ThemeProps) {
  const stack = sideSlides.slice(0, 3);
  while (stack.length < 2 && carouselSlides.length > 1) {
    const next = carouselSlides[stack.length + 1];
    if (!next || stack.some((s) => s.key === next.key)) break;
    stack.push(next);
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f8fafc 0%, #ffffff 48%, #fff7ed 100%)",
        }}
      />
      <div className="mx-auto max-w-screen-xl px-6 pb-5 pt-0 xl:px-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c2410c]">
              Today&apos;s marketplace
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Discover deals worth opening
            </h2>
          </div>
          <AppStoreBadges
            playStoreUrl={playStoreUrl}
            appStoreUrl={appStoreUrl}
            variant="inline"
            align="start"
            className="hidden md:block"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-8">
            <HeroCarousel
              slides={carouselSlides}
              frameClassName="min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]"
              roundedClassName="rounded-2xl"
              objectFit="cover"
              showDots
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:gap-5">
            {stack.length ? (
              stack.map((slide, idx) => (
                <PromoTile
                  key={slide.key}
                  slide={slide}
                  className={`rounded-2xl ${idx === 0 ? "min-h-[180px] lg:min-h-[200px]" : "min-h-[140px] lg:min-h-[190px]"}`}
                />
              ))
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm text-slate-500">
                Add Hero top / Hero bottom adverts for the deal stack.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <AppStoreBadges
            playStoreUrl={playStoreUrl}
            appStoreUrl={appStoreUrl}
            variant="inline"
            align="center"
          />
        </div>
      </div>
    </section>
  );
}

function SpotlightAppDownloadBox({
  playStoreUrl,
  appStoreUrl,
}: {
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
}) {
  return (
    <div className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-center shadow-sm ring-1 ring-slate-800/80 sm:min-h-[128px]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-200/90">
          Shop on the go
        </p>
        <p className="mt-1 text-sm leading-snug text-slate-100">
          Get the Hawola app for faster checkout, live deals, and order tracking.
        </p>
      </div>
      <AppStoreBadges
        playStoreUrl={playStoreUrl}
        appStoreUrl={appStoreUrl}
        variant="inline"
        tone="dark"
        layout="badgesOnly"
        className="flex justify-center [&_img]:h-9"
      />
    </div>
  );
}

function SpotlightRailTheme({ carouselSlides, sideSlides, playStoreUrl, appStoreUrl }: ThemeProps) {
  const rail = sideSlides.slice(0, 2);

  return (
    <section className="relative overflow-hidden pb-2 pt-0">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 320px at 50% -10%, rgba(254,150,54,0.16), transparent 60%), linear-gradient(180deg, #0f172a 0%, #1e293b 42%, #f8fafc 42.1%, #f8fafc 100%)",
        }}
      />

      <div className="mx-auto max-w-screen-xl px-6 pt-4 xl:px-0 sm:pt-6">
        <div className="overflow-hidden rounded-[1.35rem] bg-slate-900 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.65)] ring-1 ring-white/15">
          <HeroCarousel
            slides={carouselSlides}
            frameClassName="min-h-[52vw] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[420px]"
            roundedClassName="rounded-none"
            objectFit="contain"
            imageClassName="bg-slate-900"
            showDots
          />
        </div>

        {/* Mobile: 2 small banners on one row. App promo hidden on mobile, full rail on sm+. */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {rail.map((slide) => (
            <PromoTile
              key={slide.key}
              slide={slide}
              className="min-h-[100px] rounded-xl shadow-sm ring-1 ring-slate-200/80 sm:min-h-[128px]"
            />
          ))}
          <div className="hidden sm:block sm:col-span-1">
            <SpotlightAppDownloadBox playStoreUrl={playStoreUrl} appStoreUrl={appStoreUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

const THEME_RENDERERS: Record<HomepageHeroTheme, (props: ThemeProps) => React.ReactElement> = {
  boxed_marketplace: BoxedMarketplaceTheme,
  cinema_wide: CinemaWideTheme,
  editorial_split: EditorialSplitTheme,
  spotlight_rail: SpotlightRailTheme,
};

/**
 * Storefront home top: switchable hero themes from site settings.
 */
export default function HomeTopRegion() {
  const { homePage, siteSettings } = useAppSelector((state) => state.general);
  const banners = (homePage?.data?.banners ?? EMPTY_BANNERS) as Banner[];
  const heroSidebarSlots = (homePage?.data?.hero_sidebar_slots ?? [null, null]) as (
    | AdvertBanner
    | null
  )[];
  const topAdvertSlots = (homePage?.data?.advert_banner ?? []) as (AdvertBanner | null)[];

  const theme = parseHomepageHeroTheme(siteSettings?.homepage_hero_theme);
  const playStoreUrl = (siteSettings?.play_store_url as string | null | undefined) ?? null;
  const appStoreUrl = (siteSettings?.app_store_url as string | null | undefined) ?? null;

  const carouselSlides = useMemo(
    () => banners.map(bannerToSlide).filter((s) => s.image),
    [banners]
  );

  const sideSlides = useMemo(() => {
    return heroSidebarSlots
      .map((slot) => (slot ? advertToSlide(slot) : null))
      .filter((s): s is HeroCreativeSlide => Boolean(s?.image));
  }, [heroSidebarSlots]);

  const hasHero = carouselSlides.length > 0;
  const Theme = THEME_RENDERERS[theme] ?? BoxedMarketplaceTheme;

  return (
    <>
      {hasHero && (
        <Theme
          carouselSlides={carouselSlides}
          sideSlides={sideSlides}
          heroSidebarSlots={heroSidebarSlots}
          playStoreUrl={playStoreUrl}
          appStoreUrl={appStoreUrl}
        />
      )}
      <AdvertSlotGrid slots={topAdvertSlots} columns={3} sectionClassName="mb-6 mt-4" />
    </>
  );
}
