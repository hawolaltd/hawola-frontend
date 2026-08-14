import React from "react";
import Link from "next/link";
import { saveProductDetailPreview } from "@/lib/pdpPreview";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { formatProductCardTitle } from "@/util/formatProductCardTitle";
import { MerchantOtherProduct } from "@/types/product";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import type { ProductFull } from "@/types/home";

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

function productHref(product: MerchantOtherProduct): string {
  const slug = product?.slug?.trim();
  if (!slug) return "#";
  return slug.startsWith("/") ? slug : `/product/${slug}`;
}

function MerchantOtherItemsCard({
  product,
}: {
  product: MerchantOtherProduct;
}) {
  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  const href = productHref(product);

  return (
    <div className="relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-solid border-[#D5DFE4] bg-white">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-slate-100 sm:aspect-square">
        <AddToCompareButton
          product={product as unknown as ProductFull}
          className="absolute top-2.5 left-2.5 z-20"
          accent="light"
          tooltipPlacement="bottom"
        />
        <Link
          href={href}
          className="absolute inset-0 block"
          aria-label={product.name}
          onClick={() => saveProductDetailPreview(product)}
        >
          <img
            src={featuredImageCardUrl(product?.featured_image?.[0])}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        </Link>
      </div>

      <Link
        href={href}
        onClick={() => saveProductDetailPreview(product)}
        className="flex min-h-0 flex-1 flex-col gap-1 p-4"
      >
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
      </Link>
    </div>
  );
}

export default MerchantOtherItemsCard;
