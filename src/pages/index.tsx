import Head from "next/head";
import HomeTopRegion from "@/components/home/HomeTopRegion";
import HomeBodyRegion from "@/components/home/HomeBodyRegion";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getCarts,
  getWishList,
} from "@/redux/product/productSlice";
import { getHomePage } from "@/redux/general/generalSlice";

export default function Home() {
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Fetch public homepage data once on mount
  useEffect(() => {
    dispatch(getHomePage());
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
      <Header />
      <HomeTopRegion />
      <HomeBodyRegion />
      <Footer />
    </div>
  );
}
