import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { PromoLandingMeta, PromoPageDesign } from "./designs/shared";
import PromoHeroBackgroundIcon from "./PromoHeroBackgroundIcon";
import { resolvePromoHeroStyle } from "./promoHeroTheme";

type Props = {
  landing: PromoLandingMeta;
  variant: PromoPageDesign;
  eyebrow?: string;
  tagline?: ReactNode;
  cta?: ReactNode;
  share?: ReactNode;
  /** Extra classes on the outer section when using text hero (no banner). */
  textHeroClass?: string;
  bannerHeightClass?: string;
};

export default function PromoHeroShell({
  landing,
  variant,
  eyebrow,
  tagline,
  cta,
  share,
  textHeroClass = "",
  bannerHeightClass = "h-[min(42vh,420px)]",
}: Props) {
  const hero = resolvePromoHeroStyle(landing);
  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    setBannerReady(false);
  }, [landing.banner_url]);

  if (landing.banner_url) {
    const overlay =
      variant === "spotlight" || variant === "electronics" || variant === "automobile"
        ? "from-black via-black/40 to-transparent"
        : variant === "festive" || variant === "real_estate"
          ? "from-black/60 via-black/15 to-transparent"
          : variant === "food"
            ? "from-[#2a1810]/80 via-[#2a1810]/30 to-transparent"
            : "from-black/70 via-black/20 to-transparent";

    return (
      <section className="relative overflow-hidden border-b border-slate-200/20 bg-slate-900">
        {!bannerReady ? (
          <div
            className={`${bannerHeightClass} w-full motion-safe:animate-pulse bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900`}
            aria-hidden
          />
        ) : null}
        <img
          src={landing.banner_url}
          alt={landing.title}
          className={`${bannerHeightClass} w-full object-cover object-center transition-opacity duration-500 ${
            bannerReady ? "opacity-100" : "absolute inset-0 opacity-0"
          }`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setBannerReady(true)}
          onError={() => setBannerReady(true)}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${overlay}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 xl:px-0">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/80">{eyebrow}</p>
            ) : null}
            <h1 className="mt-2 max-w-3xl text-3xl font-black text-white sm:text-5xl">{landing.title}</h1>
            {landing.description ? (
              <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">{landing.description}</p>
            ) : null}
            {tagline || cta ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {tagline}
                {cta}
              </div>
            ) : null}
            {share ? <div className="mt-6 border-t border-white/15 pt-6">{share}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden border-b border-black/5 ${textHeroClass}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${hero.gradientFrom} 0%, ${hero.gradientTo} 100%)`,
      }}
    >
      {hero.icon ? (
        <div
          className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 opacity-[0.18] sm:block md:-right-2 lg:right-4"
          aria-hidden
        >
          <PromoHeroBackgroundIcon
            icon={hero.icon}
            color={hero.iconColor}
            className="h-44 w-44 md:h-56 md:w-56 lg:h-72 lg:w-72"
          />
        </div>
      ) : null}
      <div className="relative mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
        {eyebrow ? (
          <p className={`text-xs font-bold uppercase tracking-[0.28em] opacity-80 ${hero.textClass}`}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={`mt-3 max-w-3xl text-3xl font-black sm:text-5xl ${hero.textClass}`}>
          {landing.title}
        </h1>
        {landing.description ? (
          <p className={`mt-4 max-w-2xl text-base sm:text-lg ${hero.subtextClass}`}>
            {landing.description}
          </p>
        ) : null}
        {tagline || cta ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">{tagline}{cta}</div>
        ) : null}
        {share ? <div className="mt-8 border-t border-black/5 pt-6">{share}</div> : null}
      </div>
    </section>
  );
}
