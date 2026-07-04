import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  resolveMerchantBannerUrl,
  type MerchantBannerImageSizes,
  type MerchantBannerSlide,
} from "@/util/merchantBanner";

type ShowcaseSlide = {
  id: number | string;
  image?: MerchantBannerImageSizes;
};

interface BannerShowcaseProps {
  banners?: MerchantBannerSlide[];
  defaultBanner?: MerchantBannerImageSizes | string | null;
  merchantBanner?: Array<{ id?: number; image?: MerchantBannerImageSizes }>;
}

function toShowcaseSlide(
  banner: MerchantBannerSlide | { id?: number; image?: MerchantBannerImageSizes },
  index: number
): ShowcaseSlide | null {
  const url = resolveMerchantBannerUrl({ banners: [banner as MerchantBannerSlide] });
  if (!url) return null;
  const id =
    "id" in banner && banner.id != null ? banner.id : `slide-${index}`;
  return { id, image: banner.image ?? { full_size: url } };
}

const BannerShowcase = ({
  banners,
  defaultBanner,
  merchantBanner,
}: BannerShowcaseProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  const allBanners = useMemo(() => {
    const slides: ShowcaseSlide[] = [];
    let index = 0;

    for (const banner of banners ?? []) {
      const slide = toShowcaseSlide(banner, index++);
      if (slide) slides.push(slide);
    }
    for (const banner of merchantBanner ?? []) {
      const slide = toShowcaseSlide(banner, index++);
      if (slide) slides.push(slide);
    }

    const defaultUrl = resolveMerchantBannerUrl({ defaultBanner });
    if (defaultUrl) {
      slides.push({
        id: "default",
        image:
          typeof defaultBanner === "string"
            ? { full_size: defaultBanner }
            : defaultBanner ?? { full_size: defaultUrl },
      });
    }

    return slides;
  }, [banners, defaultBanner, merchantBanner]);

  if (!allBanners.length) return null;

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % allBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner(
      (prev) => (prev - 1 + allBanners.length) % allBanners.length
    );
  };

  return (
    <div className="merchant-premium-banner-shell overflow-hidden rounded-2xl bg-white">
      <div className="relative">
        {/* Main Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src={
              resolveMerchantBannerUrl({
                banners: [allBanners[currentBanner]],
              }) || "/placeholder-banner.jpg"
            }
            alt="Store Banner"
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Navigation Arrows */}
          {allBanners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Banner Counter */}
          {allBanners.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
              {currentBanner + 1} / {allBanners.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {allBanners.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {allBanners.map((banner, index) => (
                <button
                  key={banner.id || index}
                  onClick={() => setCurrentBanner(index)}
                  className={`flex h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    currentBanner === index
                      ? "merchant-premium-banner-thumb-active"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={
                      resolveMerchantBannerUrl({
                        banners: [allBanners[index]],
                      }) || "/placeholder-thumb.jpg"
                    }
                    alt={`Banner ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerShowcase;
