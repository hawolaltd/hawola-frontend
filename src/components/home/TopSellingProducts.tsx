import React, { useState, useEffect } from "react";
import Image from "next/image";
import Ads3 from "@/components/svg/ads3";
import NewsSection from "@/components/home/NewsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import SubscribeSection from "@/components/home/SubscribeSection";
import { ProductResponse } from "@/types/product";
import { formatCurrency } from "@/util";
import { useAppSelector } from "@/hook/useReduxTypes";
import { AdvertBanner } from "@/types/home";

interface ProductCardProps {
  image: string;
  title: string;
  rating: number;
  reviews: number;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
}

interface TopSellingProductsProps {
  products: ProductResponse;
}

// Image Slider Component
interface ImageSliderProps {
  banners: AdvertBanner[];
}

function ImageSlider({ banners }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full group">
      {/* Main slider container */}
      <div className="relative overflow-hidden rounded-lg w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={banner.id} className="w-full flex-shrink-0 relative">
              <Image
                src={banner.web_image || banner.image}
                alt={`Advertisement ${index + 1}`}
                width={1200}
                height={300}
                className="w-full h-48 md:h- object-cover"
                priority={index === 0}
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

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play toggle */}
      {banners.length > 1 && (
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlay ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

function TopSellingProducts({ products }: TopSellingProductsProps) {
  const { homePage } = useAppSelector((state) => state.general);
  return (
    <section className="max-w-screen-xl px-6 xl:px-0 mx-auto flex flex-col gap-4 py-4">
      <div className="w-full flex justify-center py-4">
        <ImageSlider banners={homePage?.data?.advert_banner || []} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {homePage?.data?.top_selling_products
            ?.slice(0, 8)
            ?.map((item, key) => {
              return (
                <div
                  key={key}
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
                      src={item.featured_image?.[0]?.image_url}
                      alt={item.name}
                      className="w-full h-16 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-primary">
                      {item.name}
                    </h3>
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
            })}
        </div>
      </div>

      <div className="w-full flex justify-center py-4">
        <ImageSlider banners={homePage?.data?.advert_banner_middle || []} />
      </div>

      {/* <NewsSection /> */}
      <FeaturesSection />
    </section>
  );
}

export default TopSellingProducts;
