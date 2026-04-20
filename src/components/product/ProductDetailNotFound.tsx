import React from "react";
import StorefrontNotFound from "@/components/common/StorefrontNotFound";

type ProductDetailNotFoundProps = {
  /** Last path segment (slug) for subtle context; omit if unknown */
  slug?: string | null;
};

/**
 * In-layout 404 for product detail: same shell as PDP (AuthLayout header/footer).
 */
function ProductDetailNotFound({ slug }: ProductDetailNotFoundProps) {
  return (
    <StorefrontNotFound
      kicker="Product unavailable"
      headline="This listing left the building"
      description="The product may have been deactivated, removed, or the link is outdated. Try search or head home—we will not judge your shopping habits."
      pathHint={slug ? `/product/${slug}` : null}
    />
  );
}

export default ProductDetailNotFound;
