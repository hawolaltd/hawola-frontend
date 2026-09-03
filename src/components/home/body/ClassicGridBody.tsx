"use client";

import React from "react";
import TrendingProducts from "@/components/TrendingProducts";
import HawolaSpecials from "@/components/home/HawolaSpecials";
import HomeRandomCouponsSection from "@/components/home/HomeRandomCouponsSection";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";

/** Default home body — same section stack as before body themes. */
export default function ClassicGridBody() {
  return (
    <>
      <TrendingProducts />
      <HawolaSpecials />
      <HomeRandomCouponsSection className="bg-[#E8EDF3]" />
      <TopRateProducts />
      <TopSellingProducts />
      <RecentlyViewedSection />
    </>
  );
}
