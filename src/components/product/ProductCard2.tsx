import React from "react";
import { useRouter } from "next/router";
import { Product, ProductResponse } from "@/types/product";
import { formatCurrency } from "@/util";
import { ProductFull } from "@/types/home";

function ProductCard2({
  product,
  key,
  item,
}: {
  product: ProductFull[];
  key: number;
  item: ProductFull;
}) {
  const router = useRouter();
  return (
    <div
      key={key}
      onClick={() => {
        router.push(`product/${item?.slug}`);
      }}
      className={`bg-white cursor-pointer relative flex ${
        key + 1 !== product.length ? "border-b-[#dde4f0] border-b" : " "
      } pb-1 pt-4 pl-4 pr-4 overflow-hidden`}
    >
      <div className="relative">
        {item.discount_price && (
          <span className="absolute -top-2 left-0 bg-orange-500 text-white text-xs font-semibold py-1 px-1 rounded">
            -
            {(
              ((+item.price - +item.discount_price) / +item.price) *
              100
            ).toFixed()}
            %{" "}
          </span>
        )}
        <img
          src={item.featured_image?.[0]?.image_url}
          alt={item.name}
          className="w-full h-16 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-primary">
          {item.name?.length > 40 ? item.name?.slice(0, 40) + "..." : item.name}
        </h3>
        <div className={"flex items-center gap-1"}>
          {Array.from(item?.rating ?? 0).map((star, key) => (
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
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-gray-800">
            {formatCurrency(item.discount_price)}
          </span>
          <span className="text-sm line-through text-textPadded">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard2;
