import React from "react";
import { useRouter } from "next/router";
import { saveProductDetailPreview } from "@/lib/pdpPreview";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { formatProductCardTitle } from "@/util/formatProductCardTitle";
import { MerchantOtherProduct } from "@/types/product";

const STAR_PATH =
  "m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z";

/** Single star + numeric rating and review count (matches mobile product cards). */
function RatingRow({ product }: { product: MerchantOtherProduct }) {
  const reviews = product?.numReviews ?? 0;

  return (
    <div className="flex min-h-[18px] shrink-0 items-center gap-0.5">
      <svg
        className="h-3 w-3 shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="m0 0h24v24h-24z"
          fill="#fff"
          opacity="0"
          transform="matrix(0 1 -1 0 24 0)"
        />
        <path d={STAR_PATH} fill="#f59e0b" />
      </svg>
      <span className="text-[10px] text-textPadded">
        {product?.rating ?? "0"} ({reviews})
      </span>
    </div>
  );
}

function MerchantOtherItemsCard({
  product,
}: {
  product: MerchantOtherProduct;
}) {
  const router = useRouter();

  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  return (
    <div
      onClick={() => {
        saveProductDetailPreview(product);
        router.push(`${product?.slug}`);
      }}
      className="relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-solid border-[#D5DFE4] bg-white p-4"
    >
      <div className="flex h-[150px] w-full shrink-0 items-center justify-center">
        <img
          src={featuredImageCardUrl(product?.featured_image?.[0])}
          alt={product.name}
          style={{
            height: "150px",
          }}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 pt-2">
        <h3 className="line-clamp-1 shrink-0 text-[10px] font-semibold text-textPadded">
          {product.merchant?.store_name}
        </h3>
        <h3 className="line-clamp-2 min-h-0 break-words text-xs font-semibold leading-tight text-primary">
          {formatProductCardTitle(product.name)}
        </h3>
        <RatingRow product={product} />
        <div className="mt-2 shrink-0 border-t border-[#dde4f0] pt-2">
          <div className="flex flex-col gap-0.5">
            {hasDiscount ? (
              <>
                <p className="text-lg font-bold leading-tight text-primary">
                  {formatCurrency(product.discount_price)}
                </p>
                <p className="text-xs leading-tight text-textPadded line-through">
                  {formatCurrency(product.price)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold leading-tight text-primary">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantOtherItemsCard;
