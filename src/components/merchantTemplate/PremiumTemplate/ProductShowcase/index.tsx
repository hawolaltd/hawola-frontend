import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import MerchantRichHtml from "@/components/merchant/MerchantRichHtml";
import { featuredImageCardUrl } from "@/util";
import type { Product as StoreProduct } from "@/types/product";

interface Product {
  id: number;
  name: string;
  price: string;
  discount_price: string;
  rating: string;
  numReviews: number;
  featured_image: Array<{
    image_url?: string | null;
    image?: {
      thumbnail?: string;
      full_size?: string;
      thumbnail_100?: string;
    };
  }>;
  slug: string;
  is_digital: boolean;
}

interface ProductShowcaseProps {
  products: Product[];
  title?: string | null;
  subtitle?: string | null;
}

const ProductShowcase = ({
  products,
  title,
  subtitle,
}: ProductShowcaseProps) => {
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  if (!products?.length) return null;

  return (
    <div className="merchant-premium-section-shell p-6">
      <div className="mb-8">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="merchant-icon-container merchant-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <svg
              className="h-6 w-6 merchant-text-on-primary merchant-text-shadow merchant-icon-strong"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold merchant-heading-text prose prose-neutral max-w-none prose-headings:mb-0 prose-p:mb-0">
              <MerchantRichHtml html={title} />
            </div>
            <span className="merchant-premium-title-rule mt-2" aria-hidden />
          </div>
        </div>
        <div className="text-gray-600 text-sm prose prose-sm prose-neutral max-w-none prose-p:mb-1 prose-p:last:mb-0">
          <MerchantRichHtml html={subtitle} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product: Product) => {
          const showSaleBadge =
            product.price !== product.discount_price &&
            parseFloat(product.price) > 0 &&
            Number.isFinite(parseFloat(product.discount_price));

          return (
          <div
            key={product.id}
            className="merchant-premium-product-card group relative rounded-xl bg-white"
          >
            {/* Product Image: compare row sits outside clipped layer (tooltip downward) */}
            <div className="relative h-48">
              <div className="absolute inset-0 overflow-hidden rounded-t-xl bg-gray-100">
                <Image
                  src={featuredImageCardUrl(
                    product.featured_image?.[0],
                    "/images/products/product-1-sm-1.png"
                  )}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Quick Actions — idle: no hit-testing so compare stays clickable */}
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="merchant-product-action-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="merchant-product-action-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Top row: compare + digital left, sale badge right */}
              <div className="pointer-events-none absolute inset-x-0 top-2 z-[45] flex items-start justify-between gap-2 px-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <span className="pointer-events-auto shrink-0">
                    <AddToCompareButton
                      product={product as unknown as StoreProduct}
                      accent="light"
                      tooltipPlacement="bottom"
                    />
                  </span>
                  {product.is_digital && (
                    <div className="pointer-events-none shrink-0 rounded-full border border-white/85 bg-white/90 px-2 py-1 text-xs font-bold leading-tight text-slate-600 shadow-sm backdrop-blur-sm">
                      Digital
                    </div>
                  )}
                </div>
                {showSaleBadge && (
                  <div className="merchant-badge-sale-premium pointer-events-none shrink-0 rounded-full px-2 py-1 text-xs font-bold shadow-sm">
                    {Math.round(
                      ((parseFloat(product.price) -
                        parseFloat(product.discount_price)) /
                        parseFloat(product.price)) *
                        100
                    )}
                    % OFF
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="rounded-b-xl bg-white p-4">
              {/* Product ratings / review counts intentionally hidden on cards */}

              {/* Product Name */}
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors duration-300">
                <Link
                  href={`/product/${product.slug}`}
                  className="hover:merchant-primary-text transition-colors duration-200"
                >
                  {product.name}
                </Link>
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.discount_price)}
                </span>
                {product.price !== product.discount_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductShowcase;
