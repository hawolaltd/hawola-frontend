import Head from "next/head";
import {
  DEFAULT_SHARE_IMAGE,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_WIDTH,
  type BuiltSeo,
} from "@/util/storefrontSeo";

type StorefrontSeoHeadProps = {
  seo: BuiltSeo | null;
  fallbackTitle: string;
  keywordsCombined?: string;
  ogLocale?: string;
  siteName?: string | null;
  twitterSite?: string;
  faviconUrl?: string | null;
};

export default function StorefrontSeoHead({
  seo,
  fallbackTitle,
  keywordsCombined = "",
  ogLocale = "en_US",
  siteName,
  twitterSite,
  faviconUrl,
}: StorefrontSeoHeadProps) {
  const title = seo?.title || fallbackTitle;
  const ogImage = seo?.ogImage || DEFAULT_SHARE_IMAGE;
  const ogImageHttps = ogImage.startsWith("https://") ? ogImage : ogImage;
  const ogWidth = seo?.ogImageWidth || DEFAULT_SHARE_IMAGE_WIDTH;
  const ogHeight = seo?.ogImageHeight || DEFAULT_SHARE_IMAGE_HEIGHT;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={seo?.description || ""} />
      {keywordsCombined ? (
        <meta name="keywords" content={keywordsCombined.slice(0, 512)} />
      ) : null}
      <meta name="robots" content={seo?.robots || "index,follow"} />
      {seo?.canonicalUrl ? <link rel="canonical" href={seo.canonicalUrl} /> : null}
      <meta property="og:title" content={seo?.ogTitle || title} />
      <meta
        property="og:description"
        content={seo?.ogDescription || seo?.description || ""}
      />
      <meta property="og:type" content={seo?.ogType || "website"} />
      <meta property="og:locale" content={ogLocale} />
      {siteName ? <meta property="og:site_name" content={String(siteName)} /> : null}
      {seo?.canonicalUrl ? <meta property="og:url" content={seo.canonicalUrl} /> : null}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImageHttps} />
      <meta property="og:image:width" content={String(ogWidth)} />
      <meta property="og:image:height" content={String(ogHeight)} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
      <meta name="twitter:title" content={seo?.ogTitle || title} />
      <meta
        name="twitter:description"
        content={seo?.ogDescription || seo?.description || ""}
      />
      <meta name="twitter:image" content={ogImage} />
      {faviconUrl ? <link rel="icon" href={faviconUrl} /> : null}
      {seo?.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
        />
      ) : null}
    </Head>
  );
}
