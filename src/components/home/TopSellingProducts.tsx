import React from "react";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";
import { AdvertBanner } from "@/types/home";
import { HomeBodyAdvertBanners } from "@/components/home/body/HomeBodyAdvertBanners";

interface TopSellingProductsProps {
  products?: ProductResponse;
}

function TopSellingProducts({ products: _products }: TopSellingProductsProps) {
  const { homePage } = useAppSelector((state) => state.general);

  return (
    <HomeBodyAdvertBanners
      middle={(homePage?.data?.advert_banner_middle || []) as (AdvertBanner | null)[]}
      bottom={(homePage?.data?.advert_banner_bottom || []) as (AdvertBanner | null)[]}
    />
  );
}

export default TopSellingProducts;
