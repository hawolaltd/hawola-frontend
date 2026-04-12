import Head from "next/head";
import React, { useEffect } from "react";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import Drawer from "@/components/header/MobileMenuDrawer";
import HomeModernExperience from "@/components/home-modern/HomeModernExperience";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getCarts,
  getProducts,
  getWishList,
} from "@/redux/product/productSlice";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import { getHomeInsight, getHomePage } from "@/redux/general/generalSlice";

/**
 * Alternate storefront home — same Redux/API data as `/`, redesigned for first impressions.
 * Classic home remains at `/`.
 */
export default function HomeModernPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getHomePage());
    dispatch(getHomeInsight());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCarts());
      dispatch(getWishList());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Hawola | Discover the marketplace</title>
        <meta
          name="description"
          content="Explore Hawola with a refreshed experience—curated products, categories, and deals from the same trusted catalog."
        />
        <meta property="og:title" content="Hawola | Discover the marketplace" />
        <meta
          property="og:description"
          content="Explore Hawola with a refreshed experience—curated products, categories, and deals."
        />
        <meta property="og:type" content="website" />
      </Head>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => dispatch(setDrawerOpen(false))}
        messageCount={3}
      />
      <div className="border-b border-slate-200 bg-white">
        <Header />
      </div>
      <HomeModernExperience />
      <div className="bg-[#f1f3f9]">
        <Footer />
      </div>
    </div>
  );
}
