import Head from "next/head";
import HomeTopRegion from "@/components/home/HomeTopRegion";
import ProductList from "@/components/ProductList";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import React, { useEffect, useState } from "react";
import TrendingProducts from "@/components/TrendingProducts";
import Partner from "@/components/partner/Partner";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getCarts,
  getProducts,
  getWishList,
} from "@/redux/product/productSlice";
import Drawer from "@/components/header/MobileMenuDrawer";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import { getHomeInsight, getHomePage } from "@/redux/general/generalSlice";

export default function Home() {
  const { products, carts } = useAppSelector((state) => state.products);
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);

  console.log("isAuthenticated:", isAuthenticated);
  const dispatch = useAppDispatch();

  // Fetch public homepage data once on mount
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getHomePage());
    dispatch(getHomeInsight());
  }, [dispatch]);

  // Fetch user-specific data when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCarts());
      dispatch(getWishList());
    }
  }, [dispatch, isAuthenticated]);

  const appName = String(siteSettings?.app_name || "Hawola");
  const appSlogan = String(siteSettings?.app_slogan || "Find it, Own it!");
  const metaTitle = `${appName} | ${appSlogan}`;
  const metaDescription = `${appName} - ${appSlogan}`;

  return (
    <div>
      <Head>
        <title>{metaTitle}</title>
        <meta 
          name="description" 
          content={metaDescription}
        />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
      </Head>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => dispatch(setDrawerOpen(false))}
        messageCount={3}
      />
      <div className={"mb-4"}>
        <Header />
      </div>
      <HomeTopRegion />
      {/* <Partner /> */}
      {/* <ProductList products={products} /> */}
      <TrendingProducts products={products} />
      <TopRateProducts products={products} />
      <TopSellingProducts products={products} />
      <RecentlyViewedSection />
      <Footer />
    </div>
  );
}
