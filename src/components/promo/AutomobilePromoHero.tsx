import type { PromoLandingMeta } from "./designs/shared";
import SocialShareBar from "@/components/promo/SocialShareBar";

type Props = {
  landing: PromoLandingMeta;
  shareUrl?: string;
};

export default function AutomobilePromoHero({ landing, shareUrl }: Props) {
  const title = landing.title || "Vehicle sale";
  const description = (landing.description || "").trim();

  if (landing.banner_url) {
    return (
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#020617]">
        <img
          src={landing.banner_url}
          alt={title}
          className="h-[min(48vh,440px)] w-full object-cover object-center opacity-90"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.15),rgba(245,158,11,0.12))]" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 xl:px-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200/90">
              Cars &amp; vehicles
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">{description}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_15%_20%,#0f172a_0%,#020617_65%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),rgba(245,158,11,0.12))]" />
      <div className="relative mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200/90">
          Cars &amp; vehicles marketplace
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            Promoted picks
          </span>
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
            Curated for you
          </span>
          <a
            href="#promo-products"
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-black uppercase tracking-wide text-slate-900 hover:bg-amber-300"
          >
            Browse inventory ↓
          </a>
        </div>
        {shareUrl ? (
          <div className="mt-8 border-t border-slate-700/80 pt-6">
            <SocialShareBar pageUrl={shareUrl} title={title} variant="dark" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
