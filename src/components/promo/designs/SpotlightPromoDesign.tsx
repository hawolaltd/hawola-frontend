import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import {
  CURATED_TAGLINE,
  PromoBody,
  PromoDesignProps,
  PromoShareStrip,
} from "./shared";

export default function SpotlightPromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  if (!landing) {
    return <PromoBody props={props}>{null}</PromoBody>;
  }

  return (
    <PromoBody props={props}>
      {shareUrl ? (
        <PromoShareStrip
          landing={landing}
          shareUrl={shareUrl}
          className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="spotlight"
        eyebrow="Hawola exclusive"
        bannerHeightClass="h-[min(52vh,480px)]"
        tagline={
          <span className="rounded-full border border-rose-400/40 bg-rose-500/25 px-4 py-1.5 text-xs font-bold text-rose-100">
            {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow-lg"
          >
            Shop now ↓
          </a>
        }
        share={
          shareUrl ? <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="dark" /> : null
        }
      />
    </PromoBody>
  );
}
