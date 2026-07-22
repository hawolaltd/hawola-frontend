import AutomobilePromoHero from "@/components/promo/AutomobilePromoHero";
import { PromoBody, PromoDesignProps } from "./shared";

export default function AutomobilePromoDesign(props: PromoDesignProps) {
  const { landing, shareUrl } = props;
  return (
    <PromoBody props={props}>
      <AutomobilePromoHero landing={landing} shareUrl={shareUrl} />
    </PromoBody>
  );
}
