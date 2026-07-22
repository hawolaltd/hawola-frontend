import ProductCard from "@/components/product/ProductCard";
import RealEstateShowcaseCard from "@/components/product/RealEstateShowcaseCard";
import VehicleShowcaseCard from "@/components/product/VehicleShowcaseCard";
import type { PromoProductCardVariant } from "@/components/promo/promoDesignTypes";
import { ProductFull } from "@/types/home";

type Props = {
  product: ProductFull;
  variant?: PromoProductCardVariant;
  isPromoted?: boolean;
};

export default function PromoProductTile({
  product,
  variant = "default",
  isPromoted = false,
}: Props) {
  if (variant === "vehicle") {
    return <VehicleShowcaseCard product={product} promoted={isPromoted} />;
  }
  if (variant === "real_estate") {
    return <RealEstateShowcaseCard product={product} promoted={isPromoted} />;
  }
  return <ProductCard product={product} isPromoted={isPromoted} deferImage />;
}
