import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import { CURATED_TAGLINE, PromoBody, PromoDesignProps, PromoShareStrip } from "./shared";

export default function FestivePromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      {shareUrl ? (
        <PromoShareStrip
          landing={landing}
          shareUrl={shareUrl}
          className="border-b border-red-100 bg-red-50/95 backdrop-blur-md sticky top-0 z-30"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="festive"
        eyebrow="Christmas sale"
        tagline={
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-red-700 shadow-sm ring-1 ring-green-100">
            🎄 {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-green-800"
          >
            Unwrap deals ↓
          </a>
        }
        share={
          shareUrl ? (
            <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-green-100">
              <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="light" />
            </div>
          ) : null
        }
      />
    </PromoBody>
  );
}
