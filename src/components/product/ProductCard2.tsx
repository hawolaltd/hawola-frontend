import React from "react";
import { useRouter } from "next/router";
import { ProductResponse } from "@/types/product";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { ProductFull } from "@/types/home";
import { saveProductDetailPreview } from "@/lib/pdpPreview";

function ProductCard2({
  product,
  index,
  item,
}: {
  /** Full list this row belongs to (for bottom border). May be undefined before home data loads. */
  product?: ProductFull[] | null;
  /** Row index in list (for borders); not React's `key` */
  index: number;
  item: ProductFull;
}) {
  const router = useRouter();
  const listLen = product?.length ?? 0;
  const hasDiscount =
    item?.discount_price != null &&
    item?.price != null &&
    String(item.discount_price).trim() !== "" &&
    String(item.discount_price) !== String(item.price);
  return (
    <div
      onClick={() => {
        saveProductDetailPreview(item);
        router.push(`product/${item?.slug}`);
      }}
      className={`relative flex cursor-pointer gap-3 overflow-hidden bg-white px-3 py-3 ${
        index + 1 !== listLen ? "border-b border-[#dde4f0]" : ""
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/60">
        {item.discount_price && (
          <span className="absolute left-0 top-0 z-[1] rounded-br bg-orange-500 px-1 py-0.5 text-[10px] font-bold leading-none text-white">
            -
            {(
              ((+item.price - +item.discount_price) / +item.price) *
              100
            ).toFixed()}
            %
          </span>
        )}
        <img
          src={featuredImageCardUrl(item.featured_image?.[0])}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 pr-1 pt-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-primary">
          {item.name?.length > 40 ? item.name?.slice(0, 40) + "..." : item.name}
        </h3>
        {/* Ratings hidden on product cards
        <div className={"flex items-center gap-1"}>
          {Array.from({ length: Math.min(5, Math.max(0, Math.round(Number(item?.rating) || 0))) }).map((_, key) => (
            <svg
              className={"w-4 h-4"}
              key={key}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m0 0h24v24h-24z"
                fill="#fff"
                opacity="0"
                transform="matrix(0 1 -1 0 24 0)"
              />
              <path
                d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                fill="#FFB067"
              />
            </svg>
          ))}
          <span className={"text-[10px] text-textPadded font-normal"}>
            (65)
          </span>
        </div>
        <p className="text-sm text-primary">{item.numReviews} reviews</p>
        */}
        <div className="mt-2 border-t border-[#dde4f0] pt-2 flex flex-col gap-0.5">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {formatCurrency(item.discount_price)}
              </span>
              <span className="text-xs line-through text-textPadded leading-tight">
                {formatCurrency(item.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard2;
