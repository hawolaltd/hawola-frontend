import React, { useState } from "react";
import Image from "next/image";

interface Banner {
  id: number;
  image: {
    medium_square_crop: string;
    thumbnail_100: string;
    thumbnail: string;
    full_size: string;
  };
  image_ppoi: string;
}

interface BannerShowcaseProps {
  banners: Banner[];
  defaultBanner: {
    medium_square_crop: string;
    thumbnail_100: string;
    thumbnail: string;
    full_size: string;
  };
  merchantBanner: any[];
}

const BannerShowcase = ({
  banners,
  defaultBanner,
  merchantBanner,
}: BannerShowcaseProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Combine all banners
  const allBanners = [
    ...(banners || []),
    ...(merchantBanner || []),
    { id: "default", image: defaultBanner, image_ppoi: "center" },
  ].filter((banner) => banner && banner.image);

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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative">
        {/* Main Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src={
              allBanners[currentBanner]?.image?.full_size ||
              allBanners[currentBanner]?.image?.medium_square_crop ||
              "/placeholder-banner.jpg"
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
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    currentBanner === index
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={
                      banner.image?.thumbnail ||
                      banner.image?.thumbnail_100 ||
                      "/placeholder-thumb.jpg"
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
