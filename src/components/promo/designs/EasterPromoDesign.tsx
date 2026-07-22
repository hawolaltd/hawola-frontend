import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import { CURATED_TAGLINE, PromoBody, PromoDesignProps, PromoShareStrip } from "./shared";

export default function EasterPromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      {shareUrl ? (
        <PromoShareStrip
          landing={landing}
          shareUrl={shareUrl}
          className="border-b border-violet-100 bg-violet-50/95 backdrop-blur-md sticky top-0 z-30"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="easter"
        eyebrow="Spring sale"
        tagline={
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-700 shadow-sm ring-1 ring-violet-100">
            🐣 {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            Hop to deals ↓
          </a>
        }
        share={
          shareUrl ? <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="light" /> : null
        }
      />
    </PromoBody>
  );
}
