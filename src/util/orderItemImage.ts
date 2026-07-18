import { featuredImageCardSrc } from "./featuredImage";
import { normalizeMediaSrc } from "@/components/common/OptimizedImage";

type OrderItemImageSource = {
  image?: string | null;
  product?: {
    featured_image?: Parameters<typeof featuredImageCardSrc>[0][];
  };
} | null | undefined;

/** Resolve order line-item image for lists and detail pages. */
export function orderItemImageUrl(
  item: OrderItemImageSource,
  placeholder = "/placeholder.png"
): string {
  const fromFeatured = featuredImageCardSrc(item?.product?.featured_image?.[0]);
  if (fromFeatured) {
    return normalizeMediaSrc(fromFeatured) || placeholder;
  }
  const fromSnapshot = normalizeMediaSrc(item?.image);
  return fromSnapshot || placeholder;
}
