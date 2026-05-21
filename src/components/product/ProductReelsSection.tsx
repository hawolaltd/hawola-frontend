"use client";

import type { ProductReel } from "@/types/product";
import { StorefrontReelsGallery } from "@/components/reels/StorefrontReelsGallery";

function ProductReelsSection({ reels }: { reels?: ProductReel[] | null }) {
  return (
    <StorefrontReelsGallery
      reels={reels}
      heading="Product Social Reel"
      description=""
      className="mt-1 sm:mt-2"
      tone="prominent"
    />
  );
}

export default ProductReelsSection;
