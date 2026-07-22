import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import {
  CURATED_TAGLINE,
  PromoBody,
  PromoDesignProps,
  PromoShareStrip,
} from "./shared";

export default function MinimalPromoDesign(props: PromoDesignProps) {
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
          className="border-b border-slate-100 bg-white sticky top-0 z-30"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="minimal"
        eyebrow="Promo"
        tagline={
          <span className="text-sm font-medium text-slate-700">{CURATED_TAGLINE}</span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Shop now ↓
          </a>
        }
        share={
          shareUrl ? <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="light" /> : null
        }
      />
    </PromoBody>
  );
}
