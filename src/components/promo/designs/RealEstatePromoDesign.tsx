import RealEstatePromoHero from "@/components/promo/RealEstatePromoHero";
import { PromoBody, PromoDesignProps } from "./shared";

export default function RealEstatePromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      <RealEstatePromoHero landing={landing} shareUrl={shareUrl} />
    </PromoBody>
  );
}
