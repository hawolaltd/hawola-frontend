import Head from "next/head";
import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import React, { useEffect, useState } from "react";
import Category from "@/components/category/Category";
import TrendingProducts from "@/components/TrendingProducts";
import Partner from "@/components/partner/Partner";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
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

  return (
    <div>
      <Head>
        <title>Hawola | Everything you need, at better prices</title>
        <meta 
          name="description" 
          content="Hawola - Everything you need, at better prices. Your trusted marketplace with amazing deals on thousands of products." 
        />
        <meta property="og:title" content="Hawola | Everything you need, at better prices" />
        <meta property="og:description" content="Hawola - Everything you need, at better prices" />
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
      <Hero />
      {/* <Partner /> */}
      <Category />
      {/* <ProductList products={products} /> */}
      <TrendingProducts products={products} />
      <TopRateProducts products={products} />
      <TopSellingProducts products={products} />
      <Footer />
    </div>
  );
}
