import type { PromoLandingMeta } from "./designs/shared";
import SocialShareBar from "@/components/promo/SocialShareBar";

type Props = {
  landing: PromoLandingMeta;
  shareUrl?: string;
};

export default function RealEstatePromoHero({ landing, shareUrl }: Props) {
  const title = landing.title || "Property sale";
  const description = (landing.description || "").trim();

  if (landing.banner_url) {
    return (
      <section className="relative overflow-hidden border-b border-emerald-900/30">
        <img
          src={landing.banner_url}
          alt={title}
          className="h-[min(44vh,400px)] w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 xl:px-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-100/90">
              Real estate edit
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm text-emerald-50 sm:text-base">{description}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-100/90">
          Real estate edit
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm text-emerald-50 sm:text-base">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
            Premium listings
          </span>
          <a
            href="#promo-products"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
          >
            View properties ↓
          </a>
        </div>
        {shareUrl ? (
          <div className="mt-8 border-t border-white/20 pt-6">
            <SocialShareBar pageUrl={shareUrl} title={title} variant="dark" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
