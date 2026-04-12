import type { SiteSettingsData } from "@/redux/general/generalSlice";
import type { Product } from "@/types/product";
import { formatCurrency } from "./index";
import { applySeoTemplate, stripHtmlToText, truncateSeo, type SeoVars } from "./seoTemplate";

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
  ogImage: string | null;
  ogType: string;
  robots: string;
  keywords: string;
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
  const priceLine =
    product?.discount_price && product.discount_price !== product.price
      ? `${formatCurrency(product.discount_price)} · was ${formatCurrency(product.price)}`
      : product
        ? formatCurrency(product.discount_price || product.price)
        : "";
  const snippet = truncateSeo(stripHtmlToText(product?.description), 320);
  const fallbackDesc = sstr(siteSettings?.seo_site_default_description);

  const titleT =
    sstr(siteSettings?.seo_product_meta_title_template).trim() ||
    "{{product_name}} | {{merchant_store}} | {{site_name}}";
  const descT =
    sstr(siteSettings?.seo_product_meta_description_template).trim() ||
    "{{snippet}} {{merchant_store}}. {{price_line}}";

  const vars: SeoVars = {
    product_name: productName,
    merchant_store: merchantStore,
    site_name: siteName,
    category,
    price_line: priceLine,
    snippet: snippet || fallbackDesc,
  };

  let title = applySeoTemplate(titleT, vars);
  if (!title) title = [productName, merchantStore, siteName].filter(Boolean).join(" | ");

  let description = applySeoTemplate(descT, vars);
  if (!description.trim()) {
    description = [snippet, merchantStore, priceLine].filter(Boolean).join(". ") || fallbackDesc;
  }
  if (!description.trim()) {
    description = `${productName}. ${merchantStore}. ${siteName}.`;
  }
  description = truncateSeo(description, 160);

  const base = resolveCanonicalBase(siteSettings);
  const canonicalUrl = base
    ? `${base}/product/${encodeURIComponent(pathSlug)}`
    : "";

  const img0 = product?.featured_image?.[0];
  const ogImage =
    img0?.image_url ||
    (img0?.image as { full_size?: string } | undefined)?.full_size ||
    merchant?.logo_thumbnail ||
    merchant?.logo ||
    null;

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
            price: product.discount_price || product.price,
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
    ogType: "product",
    robots,
    keywords,
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
}): BuiltSeo {
  const {
    siteSettings,
    storeName,
    storeSubtitle,
    about,
    locationLine,
    pathSlug,
    logoUrl,
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
  const canonicalUrl = base
    ? `${base}/merchants/${encodeURIComponent(pathSlug)}`
    : "";

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
    ogImage: logoUrl,
    ogType: "website",
    robots,
    keywords,
    jsonLd,
  };
}
