import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import { CURATED_TAGLINE, PromoBody, PromoDesignProps, PromoShareStrip } from "./shared";

export default function ElectronicsPromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      {shareUrl ? (
        <PromoShareStrip
          landing={landing}
          shareUrl={shareUrl}
          className="border-b border-yellow-400/30 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="electronics"
        eyebrow="Electronics sale"
        tagline={
          <span className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2 text-sm font-bold text-yellow-100">
            ⚡ {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-300"
          >
            Shop tech ↓
          </a>
        }
        share={
          shareUrl ? <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="dark" /> : null
        }
      />
    </PromoBody>
  );
}
