import { normalizeMediaSrc } from "@/components/common/OptimizedImage";
import type { SiteSettingsData } from "@/redux/general/generalSlice";
import type { FeaturedImage, Product, ProductImage } from "@/types/product";
import { featuredImageCardSrc } from "./featuredImage";
import { formatCurrency } from "./index";
import { applySeoTemplate, stripHtmlToText, truncateSeo, type SeoVars } from "./seoTemplate";

/**
 * Public JPEG large enough for WhatsApp (≥200×200). Original Cloudinary `f_auto`
 * can serve WebP/AVIF that some chat unfurlers never finish fetching.
 */
export const DEFAULT_SHARE_IMAGE =
  "https://res.cloudinary.com/dcqqstymo/image/upload/f_jpg,q_auto,w_1200,h_630,c_pad,b_rgb:1E3A8A/new_hawola_Logo_ba18cz";
export const DEFAULT_SHARE_IMAGE_WIDTH = 1200;
export const DEFAULT_SHARE_IMAGE_HEIGHT = 630;

/** Absolute URL for og:image — WhatsApp and other crawlers require a fetchable HTTPS link. */
export function resolveOgImageUrl(raw: string | null | undefined): string | null {
  const abs = normalizeMediaSrc(raw?.trim() || "");
  if (!abs) return null;
  if (abs.startsWith("https://")) return abs;
  if (abs.startsWith("http://")) return abs.replace(/^http:\/\//, "https://");
  return null;
}

function isLikelyPublicShareImage(url: string): boolean {
  return /__sized__|thumbnail|res\.cloudinary\.com|cloudinary\.com/i.test(url);
}

function isLikelyPrivateOriginal(url: string): boolean {
  return /\/media\//i.test(url) && !isLikelyPublicShareImage(url);
}

/** WhatsApp drops images under ~200×200 — skip 100px renditions. */
function isTooSmallForChatPreview(url: string): boolean {
  return /thumbnail__100x100|crop__100x100|[_-]100x100/i.test(url);
}

function isSquareProductThumb(url: string): boolean {
  return /thumbnail__320x320|crop__400x400|crop__300x300|[_-]320x320/i.test(url);
}

/** Prefer sized/public renditions; never return empty (chat previews need an image). */
export function pickShareableImageUrl(
  candidates: Array<string | null | undefined>,
  fallback: string = DEFAULT_SHARE_IMAGE
): string {
  const resolved = candidates
    .map((c) => resolveOgImageUrl(c))
    .filter((u): u is string => Boolean(u))
    .filter((u) => !isTooSmallForChatPreview(u));
  const ranked = [
    ...resolved.filter(isSquareProductThumb),
    ...resolved.filter(isLikelyPublicShareImage),
    ...resolved.filter((u) => !isLikelyPrivateOriginal(u)),
    ...resolved,
  ];
  const seen = new Set<string>();
  for (const url of ranked) {
    if (seen.has(url)) continue;
    seen.add(url);
    return url;
  }
  return fallback;
}

/** Listing price shown to shoppers (`discount_price`), not the struck-through `price`. */
export function productSellingPrice(
  product: { price?: string | number | null; discount_price?: string | number | null } | null | undefined
): string {
  const sale = Number(product?.discount_price);
  if (Number.isFinite(sale) && sale > 0) return String(product?.discount_price);
  const list = Number(product?.price);
  if (Number.isFinite(list) && list > 0) return String(product?.price);
  return "";
}

export function siteLogoShareCandidates(site: SiteSettingsData | null): string[] {
  const logo = site?.logo as unknown;
  if (!logo) return [];
  if (typeof logo === "string") return [logo];
  if (typeof logo === "object") {
    const o = logo as Record<string, unknown>;
    return [o.thumbnail, o.thumbnail_100, o.full_size].filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0
    );
  }
  return [];
}

function productImageShareCandidates(
  product: Product | null | undefined
): string[] {
  const extras = product as
    | (Product & { product_images?: Array<FeaturedImage | ProductImage> })
    | null
    | undefined;
  const rows: Array<FeaturedImage | ProductImage | undefined> = [
    ...(product?.featured_image || []),
    ...(extras?.product_images || []),
  ];
  const urls: string[] = [];
  if (typeof product?.image === "string" && product.image.trim()) {
    urls.push(product.image);
  }
  for (const row of rows) {
    if (!row) continue;
    const img = (row as FeaturedImage).image;
    if (img && typeof img === "object") {
      if (img.thumbnail) urls.push(img.thumbnail);
    }
    const card = featuredImageCardSrc(row);
    if (card) urls.push(card);
    if (img && typeof img === "object" && img.full_size) {
      urls.push(img.full_size);
    }
    if ("image_url" in row && typeof row.image_url === "string") {
      urls.push(row.image_url);
    }
  }
  return urls;
}

function sstr(v: unknown): string {
  return v == null ? "" : String(v);
}

export function resolveCanonicalBase(site: SiteSettingsData | null): string {
  const raw = sstr(site?.seo_canonical_base_url).trim();
  if (raw) return raw.replace(/\/+$/, "");
  const env =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : undefined;
  if (env?.trim()) return env.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export interface BuiltSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth: number;
  ogImageHeight: number;
  ogType: string;
  robots: string;
  keywords: string;
  twitterCard?: string;
  priceAmount?: string | null;
  priceCurrency?: string;
  jsonLd?: Record<string, unknown>;
}

export function buildProductSeo(params: {
  siteSettings: SiteSettingsData | null;
  product: Product | null | undefined;
  pathSlug: string;
}): BuiltSeo {
  const { siteSettings, product, pathSlug } = params;
  const siteName = sstr(siteSettings?.app_name).trim() || "Hawola";
  const merchant = product?.merchant;
  const merchantStore = sstr(merchant?.store_name).trim();
  const productName = sstr(product?.name).trim();
  const category = sstr(product?.category?.name).trim();
  const sellingRaw = productSellingPrice(product);
  const priceLine = sellingRaw ? formatCurrency(sellingRaw) : "";
  const snippet = truncateSeo(stripHtmlToText(product?.description), 220);
  const fallbackDesc = sstr(siteSettings?.seo_site_default_description);

  const titleT =
    sstr(siteSettings?.seo_product_meta_title_template).trim() ||
    "{{product_name}} · {{price_line}} | {{merchant_store}} | {{site_name}}";

  const vars: SeoVars = {
    product_name: productName,
    merchant_store: merchantStore,
    site_name: siteName,
    category,
    price_line: priceLine,
    snippet: snippet || fallbackDesc,
  };

  let title = applySeoTemplate(titleT, vars);
  if (!title) title = [productName, priceLine, merchantStore, siteName].filter(Boolean).join(" | ");
  if (priceLine && productName && !title.includes(priceLine)) {
    title = `${productName} · ${priceLine}`;
  }

  let description = [priceLine, merchantStore, snippet || fallbackDesc]
    .filter(Boolean)
    .join(" · ");
  if (!description.trim()) {
    description = `${productName}. ${merchantStore}. ${siteName}.`;
  }
  description = truncateSeo(description, 160);

  const base = resolveCanonicalBase(siteSettings);
  const canonicalUrl = base
    ? `${base}/product/${encodeURIComponent(pathSlug)}`
    : "";

  const ogImage = pickShareableImageUrl([
    ...productImageShareCandidates(product),
    merchant?.logo_thumbnail || null,
    merchant?.logo || null,
    ...siteLogoShareCandidates(siteSettings),
  ]);
  const usingDefaultShare = ogImage === DEFAULT_SHARE_IMAGE;

  const robots = sstr(siteSettings?.seo_default_robots).trim() || "index,follow";
  const keywords = truncateSeo(
    [sstr(siteSettings?.seo_site_default_keywords), productName, merchantStore, category]
      .filter(Boolean)
      .join(", "),
    256
  );

  const jsonLd: Record<string, unknown> | undefined =
    product && productName
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: productName,
          ...(ogImage ? { image: [ogImage] } : {}),
          description: truncateSeo(stripHtmlToText(product.description), 500),
          ...(product.sku ? { sku: product.sku } : {}),
          ...(merchantStore ? { brand: { "@type": "Brand", name: merchantStore } } : {}),
          offers: {
            "@type": "Offer",
            ...(canonicalUrl ? { url: canonicalUrl } : {}),
            priceCurrency: "NGN",
            price: sellingRaw || product.discount_price || product.price,
            availability:
              (product.countInStock ?? 0) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }
      : undefined;

  return {
    title: truncateSeo(title, 70),
    description,
    canonicalUrl,
    ogTitle: truncateSeo(title, 70),
    ogDescription: description,
    ogImage,
    ogImageWidth: usingDefaultShare ? DEFAULT_SHARE_IMAGE_WIDTH : 320,
    ogImageHeight: usingDefaultShare ? DEFAULT_SHARE_IMAGE_HEIGHT : 320,
    ogType: "product",
    robots,
    keywords,
    twitterCard: "summary",
    priceAmount: sellingRaw || null,
    priceCurrency: "NGN",
    jsonLd,
  };
}

export function buildMerchantSeo(params: {
  siteSettings: SiteSettingsData | null;
  storeName: string;
  storeSubtitle: string;
  about: string;
  locationLine: string;
  pathSlug: string;
  logoUrl: string | null;
  logoThumbnail?: string | null;
  bannerUrl?: string | null;
}): BuiltSeo {
  const {
    siteSettings,
    storeName,
    storeSubtitle,
    about,
    locationLine,
    pathSlug,
    logoUrl,
    logoThumbnail,
    bannerUrl,
  } = params;
  const siteName = sstr(siteSettings?.app_name).trim() || "Hawola";
  const name = sstr(storeName).trim();
  const subtitle = stripHtmlToText(storeSubtitle);
  const aboutPlain = truncateSeo(stripHtmlToText(about), 400);
  const snippet =
    truncateSeo(aboutPlain || subtitle || sstr(siteSettings?.seo_site_default_description), 320);

  const titleT =
    sstr(siteSettings?.seo_merchant_meta_title_template).trim() ||
    "{{store_name}} | {{site_name}}";
  const descT =
    sstr(siteSettings?.seo_merchant_meta_description_template).trim() || "{{snippet}}";

  const vars: SeoVars = {
    store_name: name,
    site_name: siteName,
    location: locationLine,
    snippet: snippet || sstr(siteSettings?.seo_site_default_description),
  };

  let title = applySeoTemplate(titleT, vars);
  if (!title) title = [name, siteName].filter(Boolean).join(" | ");

  let description = applySeoTemplate(descT, vars);
  if (!description.trim()) {
    description = [snippet, locationLine].filter(Boolean).join(" · ");
  }
  if (!description.trim()) {
    description = sstr(siteSettings?.seo_site_default_description) || `${name} on ${siteName}`;
  }
  description = truncateSeo(description, 160);

  const base = resolveCanonicalBase(siteSettings);
  const canonicalUrl = base ? `${base}/${encodeURIComponent(pathSlug)}` : "";

  const robots = sstr(siteSettings?.seo_default_robots).trim() || "index,follow";
  const keywords = truncateSeo(
    [sstr(siteSettings?.seo_site_default_keywords), name, locationLine]
      .filter(Boolean)
      .join(", "),
    256
  );

  const jsonLd: Record<string, unknown> | undefined = name
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name,
        ...(canonicalUrl ? { url: canonicalUrl } : {}),
        ...(logoUrl ? { image: logoUrl } : {}),
        ...(description ? { description } : {}),
      }
    : undefined;

  return {
    title: truncateSeo(title, 70),
    description,
    canonicalUrl,
    ogTitle: truncateSeo(title, 70),
    ogDescription: description,
    ogImage: pickShareableImageUrl([
      logoThumbnail,
      logoUrl,
      bannerUrl,
      ...siteLogoShareCandidates(siteSettings),
    ]),
    ogImageWidth: DEFAULT_SHARE_IMAGE_WIDTH,
    ogImageHeight: DEFAULT_SHARE_IMAGE_HEIGHT,
    ogType: "website",
    robots,
    keywords,
    jsonLd,
  };
}

export function buildHomeSeo(siteSettings: SiteSettingsData | null): BuiltSeo {
  const siteName = sstr(siteSettings?.app_name).trim() || "Hawola";
  const slogan = sstr(siteSettings?.app_slogan).trim() || "Find it, Own it!";
  const fallbackDesc = sstr(siteSettings?.seo_site_default_description).trim();
  const title = `${siteName} | ${slogan}`;
  const description = truncateSeo(fallbackDesc || `${siteName} — ${slogan}`, 160);
  const base = resolveCanonicalBase(siteSettings);
  const ogImage = pickShareableImageUrl(siteLogoShareCandidates(siteSettings));

  return {
    title: truncateSeo(title, 70),
    description,
    canonicalUrl: base,
    ogTitle: truncateSeo(title, 70),
    ogDescription: description,
    ogImage,
    ogImageWidth: DEFAULT_SHARE_IMAGE_WIDTH,
    ogImageHeight: DEFAULT_SHARE_IMAGE_HEIGHT,
    ogType: "website",
    robots: sstr(siteSettings?.seo_default_robots).trim() || "index,follow",
    keywords: truncateSeo(sstr(siteSettings?.seo_site_default_keywords), 256),
  };
}
