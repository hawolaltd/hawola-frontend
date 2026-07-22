import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import {
  CURATED_TAGLINE,
  PromoBody,
  PromoDesignProps,
  PromoShareStrip,
} from "./shared";

export default function ClassicPromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  if (!landing) {
    return <PromoBody props={props}>{null}</PromoBody>;
  }

  return (
    <PromoBody props={props}>
      {shareUrl ? <PromoShareStrip landing={landing} shareUrl={shareUrl} /> : null}
      <PromoHeroShell
        landing={landing}
        variant="classic"
        eyebrow="Hawola promo"
        tagline={
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-black/5">
            {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Shop now ↓
          </a>
        }
        share={
          shareUrl && !landing.banner_url ? (
            <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="light" />
          ) : null
        }
      />
    </PromoBody>
  );
}
