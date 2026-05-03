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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 merchant-card-bg">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center merchant-icon-container">
            <svg
              className="w-6 h-6 merchant-text-on-primary merchant-text-shadow merchant-icon-strong"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
          <div className="text-2xl font-bold merchant-heading-text prose prose-neutral max-w-none prose-headings:mb-0 prose-p:mb-0">
            <MerchantRichHtml html={title} />
          </div>
        </div>
        <div className="text-gray-600 text-sm prose prose-sm prose-neutral max-w-none prose-p:mb-1 prose-p:last:mb-0">
          <MerchantRichHtml html={subtitle} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product: Product) => (
          <div
            key={product.id}
            className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <AddToCompareButton
                product={product as unknown as StoreProduct}
                className="absolute bottom-3 left-3 z-30"
              />
              <Image
                src={featuredImageCardUrl(
                  product.featured_image?.[0],
                  "/images/products/product-1-sm-1.png"
                )}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Digital Badge */}
              {product.is_digital && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Digital
                </div>
              )}

              {/* Discount Badge */}
              {product.price !== product.discount_price && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round(
                    ((parseFloat(product.price) -
                      parseFloat(product.discount_price)) /
                      parseFloat(product.price)) *
                      100
                  )}
                  % OFF
                </div>
              )}

              {/* Quick Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
                    <svg
                      className="w-5 h-5"
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
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors duration-200">
                    <svg
                      className="w-5 h-5"
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

            {/* Product Info */}
            <div className="p-4">
              {/* Product ratings / review counts intentionally hidden on cards */}

              {/* Product Name */}
              <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                <Link href={`/shop-details/${product.slug}`}>
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

              {/* Add to Cart Button */}
              <button className="w-full mt-3 merchant-button py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;
