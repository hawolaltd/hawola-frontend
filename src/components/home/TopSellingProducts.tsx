import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import FeaturesSection from "@/components/home/FeaturesSection";
import { ProductResponse } from "@/types/product";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { useAppSelector } from "@/hook/useReduxTypes";
import { AdvertBanner } from "@/types/home";
import Link from "next/link";

interface TopSellingProductsProps {
  products: ProductResponse;
}

// Image Slider Component
interface ImageSliderProps {
  banners: (AdvertBanner | null)[];
}

function ImageSlider({ banners }: ImageSliderProps) {
  const validBanners = (banners || []).filter(Boolean) as AdvertBanner[];
  if (!validBanners.length) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {validBanners.map((banner) => (
          <div key={banner.id} className="relative overflow-hidden rounded-xl bg-slate-100 shadow-sm">
            <OptimizedImage
              src={banner.web_image || banner.image || banner.web_banner_image || banner.banner_image}
              alt="Advertisement"
              width={1200}
              height={300}
              className="h-32 w-full object-cover sm:h-40"
            />
            {banner.url && (
              <a
                href={banner.url}
                className="absolute inset-0 z-10"
                target="_blank"
                rel="noopener noreferrer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoColumnAdvertGrid({ banners }: ImageSliderProps) {
  const validBanners = (banners || []).filter(Boolean) as AdvertBanner[];
  if (!validBanners.length) {
    return null;
  }
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {validBanners.map((banner) => (
          <div key={banner.id} className="relative overflow-hidden rounded-xl bg-slate-100 shadow-sm">
            <OptimizedImage
              src={banner.web_image || banner.image || banner.web_banner_image || banner.banner_image}
              alt="Advertisement"
              width={1200}
              height={300}
              className="h-36 w-full object-cover sm:h-44"
            />
            {banner.url && (
              <a
                href={banner.url}
                className="absolute inset-0 z-10"
                target="_blank"
                rel="noopener noreferrer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopSellingProducts({ products: _products }: TopSellingProductsProps) {
  const { homePage } = useAppSelector((state) => state.general);
  return (
    <section className="max-w-screen-xl px-6 xl:px-0 mx-auto flex flex-col gap-4 py-4">
      <div className="w-full flex justify-center py-4">
        <ImageSlider banners={(homePage?.data?.advert_banner_middle || []) as (AdvertBanner | null)[]} />
      </div>

      <div className="w-full flex flex-col justify-center py-4">
        <div className="flex flex-col mx-auto text-left mb-8 w-full border-b border-b-[#CAD6EC] pb-4">
          <div className={"flex flex-col "}>
            <h2 className="text-xl font-bold text-primary">
              Top Selling Products
            </h2>
            <p className={"text-xs text-textPadded"}>
              Special products in this month.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {homePage?.data?.top_selling_products
            ?.slice(0, 8)
            ?.map((item, key) => {
              return (
                <Link
                  key={key}
                  href={`/product/${item.slug}`}
                  className={`bg-white relative flex border-[#dde4f0] border pb-1 pt-4 pl-4 pr-4 overflow-hidden`}
                >
                  <div className="relative">
                    {item.discount_price && (
                      <span className="absolute -top-2 left-0 bg-orange-500 text-white text-xs font-semibold py-1 px-1 rounded">
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
                      className="w-full h-16 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-primary">
                      {item.name}
                    </h3>
                    {/* Ratings hidden on product cards
                    <div className={"flex items-center gap-1"}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          className={"w-4 h-4"}
                          key={star}
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
                      <span
                        className={"text-[10px] text-textPadded font-normal"}
                      >
                        (65)
                      </span>
                    </div>
                    <p className="text-sm text-primary">
                      {item.numReviews} reviews
                    </p>
                    */}
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(item.discount_price)}
                      </span>
                      <span className="text-sm line-through text-textPadded">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      <div className="w-full flex justify-center py-4">
        <TwoColumnAdvertGrid banners={(homePage?.data?.advert_banner_bottom || []) as (AdvertBanner | null)[]} />
      </div>

      {/* <NewsSection /> */}
      <FeaturesSection />
    </section>
  );
}

export default TopSellingProducts;
