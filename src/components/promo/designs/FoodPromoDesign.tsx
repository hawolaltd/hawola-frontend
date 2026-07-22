import SocialShareBar from "@/components/promo/SocialShareBar";
import PromoHeroShell from "@/components/promo/PromoHeroShell";
import { CURATED_TAGLINE, PromoBody, PromoDesignProps, PromoShareStrip } from "./shared";

export default function FoodPromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      {shareUrl ? (
        <PromoShareStrip
          landing={landing}
          shareUrl={shareUrl}
          className="border-b border-amber-200/80 bg-[#faf6f1]/95 backdrop-blur-md sticky top-0 z-30"
        />
      ) : null}
      <PromoHeroShell
        landing={landing}
        variant="food"
        eyebrow="Food & treats"
        tagline={
          <span className="rounded-full bg-amber-100/90 px-4 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300/50">
            🍫 {CURATED_TAGLINE}
          </span>
        }
        cta={
          <a
            href="#promo-products"
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-amber-950 hover:bg-amber-300"
          >
            Taste the deals ↓
          </a>
        }
        share={
          shareUrl ? <SocialShareBar pageUrl={shareUrl} title={landing.title} variant="light" /> : null
        }
      />
    </PromoBody>
  );
}
