import type { ProductFull } from "@/types/home";
import {
  featuredImageCardSrc,
  type FeaturedImageCardEntry,
} from "@/util/featuredImage";

export type ProductDetailPreview = {
  slug: string;
  name: string;
  price?: string;
  discount_price?: string;
  featured_image?: Array<{ image_url?: string }>;
  merchant?: {
    store_name?: string;
    slug?: string;
    primary_color?: string;
    logo?: string;
    logo_thumbnail?: string;
  };
  contact_merchant_only?: boolean;
};

const keyFor = (slug: string) => `hawola_pdp_preview_${slug}`;

export function previewImageFromPreview(
  preview: ProductDetailPreview | null | undefined
): string | null {
  if (!preview?.featured_image?.length) return null;
  const entry = preview.featured_image[0] as FeaturedImageCardEntry;
  return (
    featuredImageCardSrc(entry) ??
    (typeof entry?.image_url === "string" && entry.image_url.trim()
      ? entry.image_url.trim()
      : null)
  );
}

export function saveProductDetailPreview(
  product: Pick<
    ProductFull,
    "slug" | "name" | "price" | "discount_price" | "featured_image" | "merchant"
  > & {
    contact_merchant_only?: boolean;
  }
): void {
  if (typeof window === "undefined" || !product?.slug) return;

  const cardSrc = featuredImageCardSrc(
    product.featured_image?.[0] as FeaturedImageCardEntry | undefined
  );
  const featured_image = cardSrc
    ? [
        {
          ...(product.featured_image?.[0] as object),
          image_url: cardSrc,
        },
      ]
    : product.featured_image;

  const preview: ProductDetailPreview = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    discount_price: product.discount_price,
    featured_image,
    merchant: product.merchant
      ? {
          store_name: product.merchant.store_name,
          slug: product.merchant.slug,
          primary_color: (product.merchant as { primary_color?: string })
            .primary_color,
          logo: (product.merchant as { logo?: string }).logo,
          logo_thumbnail: (product.merchant as { logo_thumbnail?: string })
            .logo_thumbnail,
        }
      : undefined,
    contact_merchant_only: (product as { contact_merchant_only?: boolean })
      .contact_merchant_only,
  };
  try {
    sessionStorage.setItem(keyFor(product.slug), JSON.stringify(preview));
  } catch {
    /* quota / private mode */
  }
}

export function readProductDetailPreview(
  slug: string
): ProductDetailPreview | null {
  if (typeof window === "undefined" || !slug) return null;
  try {
    const raw = sessionStorage.getItem(keyFor(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductDetailPreview;
    if (parsed?.slug === slug && parsed?.name) return parsed;
  } catch {
    return null;
  }
  return null;
}

export function clearProductDetailPreview(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    sessionStorage.removeItem(keyFor(slug));
  } catch {
    /* ignore */
  }
}
