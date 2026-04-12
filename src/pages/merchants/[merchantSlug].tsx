import NormalMerchantPage from "@/components/merchantTemplate/Normal";
import DashboardTemplate from "@/components/merchantTemplate/PremiumTemplate";
import StandardTemplate from "@/components/merchantTemplate/Standard";
import BasicTemplate from "@/components/merchantTemplate/Basic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useEffect, useMemo, useRef } from "react";
import { getMerchantProfile } from "@/redux/product/productSlice";
import { buildMerchantSeo } from "@/util/storefrontSeo";

export default function MerchantPage() {
  const router = useRouter();
  const { merchantSlug, ...rest } = router.query;
  const dispatch = useAppDispatch();
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);
  
  const fetchedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (merchantSlug && typeof merchantSlug === 'string') {
      // Only fetch if we haven't fetched this slug yet
      if (fetchedSlugRef.current !== merchantSlug) {
        fetchedSlugRef.current = merchantSlug;
        dispatch(getMerchantProfile(merchantSlug));
      }
    }
  }, [merchantSlug, dispatch]);

  const templateName = (data?.home_page?.template_name as { name?: string })
    ?.name;

  const slugStr =
    typeof merchantSlug === "string"
      ? merchantSlug
      : Array.isArray(merchantSlug)
        ? merchantSlug[0] ?? ""
        : "";

  const merchantSeo = useMemo(() => {
    if (!data?.merchant_details || !slugStr) return null;
    const d = data.merchant_details;
    const loc = [d.location?.name, d.state?.name].filter(Boolean).join(", ");
    return buildMerchantSeo({
      siteSettings,
      storeName: d.store_name || "",
      storeSubtitle: d.store_page_subtitle || "",
      about: d.about || "",
      locationLine: loc,
      pathSlug: slugStr,
      logoUrl: d.logo || null,
    });
  }, [data, slugStr, siteSettings]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Head>
          <title>
            {siteSettings?.app_name
              ? `${String(siteSettings.app_name)} | Store`
              : "Hawola | Store"}
          </title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  // Show error or not found state
  if (!data || !merchantSlug) {
    return (
      <>
        <Head>
          <title>
            Merchant not found |{" "}
            {siteSettings?.app_name ? String(siteSettings.app_name) : "Hawola"}
          </title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-gray-600">Merchant not found</p>
        </div>
      </>
    );
  }
  const ogLocale = (siteSettings?.seo_og_locale as string) || "en_US";
  const twitterSite = (siteSettings?.seo_twitter_site as string)?.trim();

  return (
    <div>
      {merchantSeo ? (
        <Head>
          <title>{merchantSeo.title}</title>
          <meta name="description" content={merchantSeo.description} />
          {merchantSeo.keywords ? (
            <meta name="keywords" content={merchantSeo.keywords.slice(0, 512)} />
          ) : null}
          <meta name="robots" content={merchantSeo.robots} />
          {merchantSeo.canonicalUrl ? (
            <link rel="canonical" href={merchantSeo.canonicalUrl} />
          ) : null}
          <meta property="og:title" content={merchantSeo.ogTitle} />
          <meta property="og:description" content={merchantSeo.ogDescription} />
          <meta property="og:type" content={merchantSeo.ogType} />
          <meta property="og:locale" content={ogLocale} />
          {siteSettings?.app_name ? (
            <meta property="og:site_name" content={String(siteSettings.app_name)} />
          ) : null}
          {merchantSeo.canonicalUrl ? (
            <meta property="og:url" content={merchantSeo.canonicalUrl} />
          ) : null}
          {merchantSeo.ogImage ? (
            <meta property="og:image" content={merchantSeo.ogImage} />
          ) : null}
          <meta name="twitter:card" content="summary_large_image" />
          {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
          <meta name="twitter:title" content={merchantSeo.ogTitle} />
          <meta name="twitter:description" content={merchantSeo.ogDescription} />
          {merchantSeo.ogImage ? (
            <meta name="twitter:image" content={merchantSeo.ogImage} />
          ) : null}
          {merchantSeo.jsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(merchantSeo.jsonLd) }}
            />
          ) : null}
        </Head>
      ) : null}

      {templateName === "Standard" && <StandardTemplate />}
      {templateName === "Premium" && <DashboardTemplate />}
      {templateName === "Basic" && <BasicTemplate />}
      {/* Default to Normal template if no template specified or Normal selected */}
      {(!templateName || templateName === "Normal") && <BasicTemplate />}
      {/* {(!templateName || templateName === "Normal") && <NormalMerchantPage />} */}
    </div>
  );
}
