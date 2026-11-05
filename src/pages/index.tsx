import HomeTopRegion from "@/components/home/HomeTopRegion";
import HomeBodyRegion from "@/components/home/HomeBodyRegion";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import StorefrontSeoHead from "@/components/seo/StorefrontSeoHead";
import React, { useEffect, useMemo } from "react";
import type { GetServerSideProps } from "next";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getCarts,
  getWishList,
} from "@/redux/product/productSlice";
import {
  getHomePage,
  type SiteSettingsData,
} from "@/redux/general/generalSlice";
import { buildHomeSeo } from "@/util/storefrontSeo";

type HomePageProps = {
  initialSiteSettings?: SiteSettingsData | null;
};

export default function Home({ initialSiteSettings = null }: HomePageProps) {
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getHomePage());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCarts());
      dispatch(getWishList());
    }
  }, [dispatch, isAuthenticated]);

  const siteSettingsForSeo = siteSettings ?? initialSiteSettings;
  const homeSeo = useMemo(
    () => buildHomeSeo(siteSettingsForSeo),
    [siteSettingsForSeo]
  );
  const twitterSite = (siteSettingsForSeo?.seo_twitter_site as string)?.trim();
  const ogLocale = (siteSettingsForSeo?.seo_og_locale as string) || "en_US";

  return (
    <div>
      <StorefrontSeoHead
        seo={homeSeo}
        fallbackTitle={homeSeo.title}
        keywordsCombined={homeSeo.keywords}
        ogLocale={ogLocale}
        siteName={siteSettingsForSeo?.app_name as string | undefined}
        twitterSite={twitterSite}
      />
      <Header />
      <HomeTopRegion />
      <HomeBodyRegion />
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const apiRoot = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  ).replace(/\/+$/, "");
  let initialSiteSettings: SiteSettingsData | null = null;
  try {
    const res = await fetch(`${apiRoot}/site/settings/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      initialSiteSettings = (await res.json()) as SiteSettingsData;
    }
  } catch {
    /* Homepage still renders; OG falls back to Hawola defaults. */
  }
  return { props: { initialSiteSettings } };
};
