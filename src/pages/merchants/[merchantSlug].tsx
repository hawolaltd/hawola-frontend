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

const MERCHANT_TEMPLATES_LOWER = ["standard", "premium", "basic", "normal"] as const;
type MerchantTemplateKey = (typeof MERCHANT_TEMPLATES_LOWER)[number];

function coerceMerchantTemplate(name: unknown): MerchantTemplateKey | null {
  const s =
    typeof name === "string"
      ? name
      : Array.isArray(name)
        ? name[0] ?? ""
        : "";
  const lower = String(s).trim().toLowerCase();
  if ((MERCHANT_TEMPLATES_LOWER as readonly string[]).includes(lower)) {
    return lower as MerchantTemplateKey;
  }
  return null;
}

/**
 * Picks which storefront template to render (case-insensitive names from API).
 * In development, `?merchantTemplate=Premium` etc. overrides API so you can iterate without DB changes.
 *
 * Default: **Basic** when the API sends no usable template name; legacy API "Normal" also maps to Basic.
 */
function resolveMerchantDisplayTemplate(
  apiName: string | undefined,
  queryParam: unknown
): MerchantTemplateKey {
  if (process.env.NODE_ENV === "development") {
    const q = coerceMerchantTemplate(queryParam);
    if (q) return q;
  }
  const fromApi = coerceMerchantTemplate(apiName) ?? "basic";
  if (fromApi === "normal") return "basic";
  return fromApi;
}

export default function MerchantPage() {
  const router = useRouter();
  const { merchantSlug } = router.query;
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

  const templateKey = resolveMerchantDisplayTemplate(
    (data?.home_page?.template_name as { name?: string })?.name,
    router.query.merchantTemplate
  );

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

      {templateKey === "standard" && <StandardTemplate />}
      {templateKey === "premium" && <DashboardTemplate />}
      {templateKey === "basic" && <BasicTemplate />}
      {templateKey === "normal" && <NormalMerchantPage />}
    </div>
  );
}
