import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import FeaturesSection from "@/components/home/FeaturesSection";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";
import { AdvertBanner } from "@/types/home";

interface TopSellingProductsProps {
  products: ProductResponse;
}

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
    <section className="mx-auto flex max-w-screen-xl flex-col gap-4 px-6 py-4 xl:px-0">
      <div className="flex w-full justify-center py-4">
        <ImageSlider banners={(homePage?.data?.advert_banner_middle || []) as (AdvertBanner | null)[]} />
      </div>


      <div className="flex w-full justify-center py-4">
        <TwoColumnAdvertGrid banners={(homePage?.data?.advert_banner_bottom || []) as (AdvertBanner | null)[]} />
      </div>

      <FeaturesSection />
    </section>
  );
}

export default TopSellingProducts;
