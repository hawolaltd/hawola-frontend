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
import { buildMerchantSeo, resolveOgImageUrl } from "@/util/storefrontSeo";
import { isReservedMerchantStoreSlug } from "@/util/merchantPublicPath";
import MerchantChatWidget from "@/components/chat/MerchantChatWidget";
import StorefrontSeoHead from "@/components/seo/StorefrontSeoHead";

const MERCHANT_TEMPLATES_LOWER = ["standard", "premium", "basic", "normal"] as const;
type MerchantTemplateKey = (typeof MERCHANT_TEMPLATES_LOWER)[number];

type MerchantPageProps = {
  initialMerchantProfile: MerchantProfile | null;
  initialSiteSettings: SiteSettingsData | null;
  merchantSlugFromServer: string;
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

function merchantBannerUrl(defaultBanner: unknown): string | null {
  if (!defaultBanner || typeof defaultBanner !== "object") return null;
  const b = defaultBanner as { full_size?: string; image?: string };
  return b.full_size?.trim() || b.image?.trim() || null;
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
  merchantSlugFromServer,
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
    const slugStr =
      typeof merchantSlug === "string"
        ? merchantSlug
        : Array.isArray(merchantSlug)
          ? merchantSlug[0] ?? ""
          : merchantSlugFromServer;
    if (!slugStr) return;
    if (fetchedSlugRef.current === slugStr) return;

    const slugMatchesSsr =
      initialMerchantProfile?.merchant_details != null &&
      initialMerchantProfile.merchant_details.slug === slugStr;

    if (slugMatchesSsr) {
      fetchedSlugRef.current = slugStr;
      return;
    }

    fetchedSlugRef.current = slugStr;
    dispatch(getMerchantProfile(slugStr));
  }, [merchantSlug, dispatch, initialMerchantProfile, merchantSlugFromServer]);

  const slugStr = useMemo(() => {
    if (typeof merchantSlug === "string" && merchantSlug.trim()) return merchantSlug.trim();
    if (Array.isArray(merchantSlug) && merchantSlug[0]?.trim()) return merchantSlug[0].trim();
    const fromProfile = initialMerchantProfile?.merchant_details?.slug?.trim();
    if (fromProfile) return fromProfile;
    const fromPath = router.asPath.match(/^\/([^/?#]+)/)?.[1];
    if (fromPath && !isReservedMerchantStoreSlug(fromPath)) return fromPath;
    return merchantSlugFromServer.trim();
  }, [
    merchantSlug,
    initialMerchantProfile?.merchant_details?.slug,
    router.asPath,
    merchantSlugFromServer,
  ]);

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
    const logoThumbnail = (d as { logo_thumbnail?: string | null }).logo_thumbnail;
    return buildMerchantSeo({
      siteSettings: siteSettingsForSeo,
      storeName: d.store_name || "",
      storeSubtitle: d.store_page_subtitle || "",
      about: d.about || "",
      locationLine: loc,
      pathSlug: slugStr,
      logoUrl: d.logo || null,
      logoThumbnail: logoThumbnail || null,
      bannerUrl: merchantBannerUrl(d.default_banner),
    });
  }, [profileSource, slugStr, siteSettingsForSeo]);

  const logoForFavicon = resolveOgImageUrl(profileSource?.merchant_details?.logo?.trim() || null);
  const hasMerchantDetails = Boolean(profileSource?.merchant_details);

  const ogLocale = (siteSettingsForSeo?.seo_og_locale as string) || "en_US";
  const twitterSite = (siteSettingsForSeo?.seo_twitter_site as string)?.trim();
  const siteName = siteSettingsForSeo?.app_name
    ? String(siteSettingsForSeo.app_name)
    : "Hawola";
  const seoFallbackTitle = merchantSeo?.title || `${siteName} | Store`;

  const seoHead = (
    <StorefrontSeoHead
      seo={merchantSeo}
      fallbackTitle={seoFallbackTitle}
      keywordsCombined={merchantSeo?.keywords || ""}
      ogLocale={ogLocale}
      siteName={siteSettingsForSeo?.app_name as string | undefined}
      twitterSite={twitterSite}
      faviconUrl={logoForFavicon}
    />
  );

  if (isLoading && !hasMerchantDetails) {
    return (
      <>
        {seoHead}
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!slugStr) {
    return (
      <>
        <Head>
          <title>Merchant not found | {siteName}</title>
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
          <title>Merchant not found | {siteName}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xl text-gray-600">Merchant not found</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {seoHead}

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
        merchantSlugFromServer: slug,
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
        signal: AbortSignal.timeout(8000),
      }),
      fetch(settingsUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
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
          merchantSlugFromServer: slug,
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
        merchantSlugFromServer: slug,
      },
    };
  } catch {
    return {
      props: {
        initialMerchantProfile: null,
        initialSiteSettings: null,
        merchantSlugFromServer: slug,
      },
    };
  }
};
