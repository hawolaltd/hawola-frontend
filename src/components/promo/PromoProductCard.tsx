import Link from "next/link";
import { useState } from "react";
import { ProductFull } from "@/types/home";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  featuredImageCardUrl,
  formatCurrency,
} from "@/util";

type Props = {
  product: ProductFull;
  featured?: boolean;
};

export default function PromoProductCard({ product, featured }: Props) {
  const initialSrc = featuredImageCardUrl(product?.featured_image?.[0]);
  const [imgSrc, setImgSrc] = useState(initialSrc);

  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        featured
          ? "border-rose-200 ring-2 ring-rose-200/70 ring-offset-2 ring-offset-[#faf8f6]"
          : "border-slate-200/90"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {featured ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            Top pick
          </span>
        ) : null}
        {hasDiscount ? (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow">
            Sale
          </span>
        ) : null}
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={() => {
            if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
              setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
            }
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.merchant?.store_name ? (
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {product.merchant.store_name}
          </p>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          {hasDiscount ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-base font-black text-rose-600">
                {formatCurrency(product.discount_price)}
              </p>
              <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p>
            </div>
          ) : (
            <p className="text-base font-black text-slate-900">{formatCurrency(product.price)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
