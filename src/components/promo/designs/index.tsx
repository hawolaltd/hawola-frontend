import type { ComponentType } from "react";
import AutomobilePromoDesign from "./AutomobilePromoDesign";
import ClassicPromoDesign from "./ClassicPromoDesign";
import EasterPromoDesign from "./EasterPromoDesign";
import ElectronicsPromoDesign from "./ElectronicsPromoDesign";
import FestivePromoDesign from "./FestivePromoDesign";
import FoodPromoDesign from "./FoodPromoDesign";
import MinimalPromoDesign from "./MinimalPromoDesign";
import RealEstatePromoDesign from "./RealEstatePromoDesign";
import SpotlightPromoDesign from "./SpotlightPromoDesign";
import type { PromoDesignProps, PromoPageDesign } from "./shared";
import { PROMO_DESIGN_OPTIONS } from "@/components/promo/promoDesignTypes";

export type { PromoDesignProps, PromoLandingMeta, PromoPageDesign, PromoPaginationMeta } from "./shared";
export { CURATED_TAGLINE } from "./shared";
export { PROMO_DESIGN_OPTIONS };

const DESIGNS: Record<PromoPageDesign, ComponentType<PromoDesignProps>> = {
  classic: ClassicPromoDesign,
  spotlight: SpotlightPromoDesign,
  minimal: MinimalPromoDesign,
  festive: FestivePromoDesign,
  easter: EasterPromoDesign,
  food: FoodPromoDesign,
  electronics: ElectronicsPromoDesign,
  automobile: AutomobilePromoDesign,
  real_estate: RealEstatePromoDesign,
};

export function PromoDesignRenderer(props: PromoDesignProps) {
  const design = props.landing.page_design || "classic";
  const Component = DESIGNS[design] ?? ClassicPromoDesign;
  return <Component {...props} />;
}
