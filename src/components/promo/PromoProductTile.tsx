import ProductCard from "@/components/product/ProductCard";
import RealEstateShowcaseCard from "@/components/product/RealEstateShowcaseCard";
import VehicleShowcaseCard from "@/components/product/VehicleShowcaseCard";
import type { PromoProductCardVariant } from "@/components/promo/promoDesignTypes";
import { ProductFull } from "@/types/home";

type Props = {
  product: ProductFull;
  variant?: PromoProductCardVariant;
  isPromoted?: boolean;
  promoSlug?: string;
};

export default function PromoProductTile({
  product,
  variant = "default",
  isPromoted = false,
  promoSlug,
}: Props) {
  if (variant === "vehicle") {
    return <VehicleShowcaseCard product={product} promoted={isPromoted} promoSlug={promoSlug} />;
  }
  if (variant === "real_estate") {
    return <RealEstateShowcaseCard product={product} promoted={isPromoted} promoSlug={promoSlug} />;
  }
  return (
    <ProductCard
      product={product}
      isPromoted={isPromoted}
      deferImage
      promoSlug={promoSlug}
    />
  );
}
