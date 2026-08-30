import Head from "next/head";
import type { BuiltSeo } from "@/util/storefrontSeo";

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
  const ogImage = seo?.ogImage;
  const ogImageHttps =
    ogImage && ogImage.startsWith("https://") ? ogImage : ogImage;

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
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImageHttps ? (
        <meta property="og:image:secure_url" content={ogImageHttps} />
      ) : null}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
      {seo?.ogTitle ? <meta name="twitter:title" content={seo.ogTitle} /> : null}
      {seo?.ogDescription ? (
        <meta name="twitter:description" content={seo.ogDescription} />
      ) : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
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
