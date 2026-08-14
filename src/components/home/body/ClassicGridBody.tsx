"use client";

import React from "react";
import TrendingProducts from "@/components/TrendingProducts";
import HawolaSpecials from "@/components/home/HawolaSpecials";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";

/** Default home body — same section stack as before body themes. */
export default function ClassicGridBody() {
  return (
    <>
      <TrendingProducts />
      <HawolaSpecials />
      <TopRateProducts />
      <TopSellingProducts />
      <RecentlyViewedSection />
    </>
  );
}
