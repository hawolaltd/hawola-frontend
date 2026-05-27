import NormalMerchantPage from "@/components/merchantTemplate/Normal";
import DashboardTemplate from "@/components/merchantTemplate/PremiumTemplate";
import StandardTemplate from "@/components/merchantTemplate/Standard";
import BasicTemplate from "@/components/merchantTemplate/Basic";
import type { SiteSettingsData } from "@/redux/general/generalSlice";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  getMerchantProfile,
  hydrateMerchantProfileFromSsr,
} from "@/redux/product/productSlice";
import { buildMerchantSeo } from "@/util/storefrontSeo";
import { isReservedMerchantStoreSlug } from "@/util/merchantPublicPath";
import MerchantChatWidget from "@/components/chat/MerchantChatWidget";

const MERCHANT_TEMPLATES_LOWER = ["standard", "premium", "basic", "normal"] as const;
type MerchantTemplateKey = (typeof MERCHANT_TEMPLATES_LOWER)[number];

type MerchantPageProps = {
  initialMerchantProfile: MerchantProfile | null;
  initialSiteSettings: SiteSettingsData | null;
};

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

export default function MerchantPage({
  initialMerchantProfile,
  initialSiteSettings,
}: MerchantPageProps) {
  const router = useRouter();
  const { merchantSlug } = router.query;
  const dispatch = useAppDispatch();
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const {
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  const fetchedSlugRef = useRef<string | null>(null);

  /** Hydrate Redux before paint when SSR returned profile so templates see data immediately. */
  useLayoutEffect(() => {
    if (initialMerchantProfile?.merchant_details) {
      dispatch(hydrateMerchantProfileFromSsr(initialMerchantProfile));
    }
  }, [dispatch, initialMerchantProfile]);

  useEffect(() => {
    if (!merchantSlug || typeof merchantSlug !== "string") return;
    if (fetchedSlugRef.current === merchantSlug) return;

    const slugMatchesSsr =
      initialMerchantProfile?.merchant_details != null &&
      initialMerchantProfile.merchant_details.slug === merchantSlug;

    if (slugMatchesSsr) {
      fetchedSlugRef.current = merchantSlug;
      return;
    }

    fetchedSlugRef.current = merchantSlug;
    dispatch(getMerchantProfile(merchantSlug));
  }, [merchantSlug, dispatch, initialMerchantProfile]);

  const slugStr =
    typeof merchantSlug === "string"
      ? merchantSlug
      : Array.isArray(merchantSlug)
        ? merchantSlug[0] ?? ""
        : "";

  /** Prefer live Redux; fall back to SSR payload before or without client fetch. */
  const profileSource: MerchantProfile | null = data?.merchant_details
    ? data
    : initialMerchantProfile;

  const siteSettingsForSeo =
    (initialSiteSettings as SiteSettingsData | null) ?? siteSettings;

  const templateKey = resolveMerchantDisplayTemplate(
    (profileSource?.home_page?.template_name as { name?: string })?.name,
    router.query.merchantTemplate
  );

  const merchantSeo = useMemo(() => {
    if (!profileSource?.merchant_details || !slugStr) return null;
    const d = profileSource.merchant_details;
    const loc = [d.location?.name, d.state?.name].filter(Boolean).join(", ");
    return buildMerchantSeo({
      siteSettings: siteSettingsForSeo,
      storeName: d.store_name || "",
      storeSubtitle: d.store_page_subtitle || "",
      about: d.about || "",
      locationLine: loc,
      pathSlug: slugStr,
      logoUrl: d.logo || null,
    });
  }, [profileSource, slugStr, siteSettingsForSeo]);

  const logoForFavicon = profileSource?.merchant_details?.logo?.trim() || null;

  const hasMerchantDetails = Boolean(profileSource?.merchant_details);

  if (isLoading && !hasMerchantDetails) {
    return (
      <>
        <Head>
          <title>
            {siteSettingsForSeo?.app_name != null &&
            String(siteSettingsForSeo.app_name).trim() !== ""
              ? `${String(siteSettingsForSeo.app_name)} | Store`
              : "Hawola | Store"}
          </title>
        </Head>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!merchantSlug) {
    return (
      <>
        <Head>
          <title>
            Merchant not found |{" "}
            {siteSettingsForSeo?.app_name
              ? String(siteSettingsForSeo.app_name)
              : "Hawola"}
          </title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xl text-gray-600">Merchant not found</p>
        </div>
      </>
    );
  }

  if (!hasMerchantDetails && !isLoading) {
    return (
      <>
        <Head>
          <title>
            Merchant not found |{" "}
            {siteSettingsForSeo?.app_name
              ? String(siteSettingsForSeo.app_name)
              : "Hawola"}
          </title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xl text-gray-600">Merchant not found</p>
        </div>
      </>
    );
  }

  const ogLocale = (siteSettingsForSeo?.seo_og_locale as string) || "en_US";
  const twitterSite = (siteSettingsForSeo?.seo_twitter_site as string)?.trim();

  const ogImageHttps =
    merchantSeo?.ogImage && merchantSeo.ogImage.startsWith("https://")
      ? merchantSeo.ogImage
      : null;

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
          {siteSettingsForSeo?.app_name ? (
            <meta
              property="og:site_name"
              content={String(siteSettingsForSeo.app_name)}
            />
          ) : null}
          {merchantSeo.canonicalUrl ? (
            <meta property="og:url" content={merchantSeo.canonicalUrl} />
          ) : null}
          {merchantSeo.ogImage ? (
            <meta property="og:image" content={merchantSeo.ogImage} />
          ) : null}
          {ogImageHttps ? (
            <meta property="og:image:secure_url" content={ogImageHttps} />
          ) : null}
          <meta name="twitter:card" content="summary_large_image" />
          {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
          <meta name="twitter:title" content={merchantSeo.ogTitle} />
          <meta name="twitter:description" content={merchantSeo.ogDescription} />
          {merchantSeo.ogImage ? (
            <meta name="twitter:image" content={merchantSeo.ogImage} />
          ) : null}
          {logoForFavicon ? <link rel="icon" href={logoForFavicon} /> : null}
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

      {profileSource?.merchant_details?.id != null ? (
        <MerchantChatWidget
          merchantId={profileSource.merchant_details.id}
          merchantStoreName={profileSource.merchant_details.store_name}
        />
      ) : null}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<MerchantPageProps> = async (ctx) => {
  const raw = ctx.params?.merchantSlug;
  const slug =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
  if (!slug) {
    return { notFound: true };
  }

  if (isReservedMerchantStoreSlug(slug)) {
    return { notFound: true };
  }

  const envBase = process.env.NEXT_PUBLIC_API_URL || "";
  const base = envBase.replace(/\/?$/, "/");
  if (!base || base === "/") {
    return {
      props: {
        initialMerchantProfile: null,
        initialSiteSettings: null,
      },
    };
  }

  try {
    const profileUrl = `${base}merchant/profile/${encodeURIComponent(slug)}/`;
    const settingsUrl = `${base}site/settings/`;

    const [profRes, siteRes] = await Promise.all([
      fetch(profileUrl, {
        headers: { Accept: "application/json" },
        redirect: "manual",
      }),
      fetch(settingsUrl, {
        headers: { Accept: "application/json" },
      }),
    ]);

    if (profRes.status === 404) {
      return { notFound: true };
    }

    if (!profRes.ok) {
      return {
        props: {
          initialMerchantProfile: null,
          initialSiteSettings: null,
        },
      };
    }

    const initialMerchantProfile = (await profRes.json()) as MerchantProfile;
    let initialSiteSettings: SiteSettingsData | null = null;
    if (siteRes.ok) {
      initialSiteSettings = (await siteRes.json()) as SiteSettingsData;
    }

    return {
      props: {
        initialMerchantProfile,
        initialSiteSettings,
      },
    };
  } catch {
    return {
      props: {
        initialMerchantProfile: null,
        initialSiteSettings: null,
      },
    };
  }
};
