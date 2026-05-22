import React, { type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { useProductDetailPrefetch } from "@/hooks/useProductDetailPrefetch";
import { saveProductDetailPreview } from "@/lib/pdpPreview";
import type { ProductFull } from "@/types/home";

type PreviewProduct = Pick<
  ProductFull,
  "slug" | "name" | "price" | "discount_price" | "featured_image" | "merchant"
> & {
  contact_merchant_only?: boolean;
};

type ProductDetailLinkProps = {
  product: PreviewProduct;
  href?: ComponentPropsWithoutRef<typeof Link>["href"];
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

/** Link to PDP — persists card preview (title + image) before navigation. */
export default function ProductDetailLink({
  product,
  href,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onTouchStart,
  children,
  ...rest
}: ProductDetailLinkProps) {
  const prefetchHandlers = useProductDetailPrefetch(product?.slug);

  const persistPreview = () => {
    if (product?.slug) saveProductDetailPreview(product);
  };

  return (
    <Link
      href={href ?? `/product/${product.slug}`}
      prefetch
      onMouseEnter={(e) => {
        prefetchHandlers.onMouseEnter();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        prefetchHandlers.onMouseLeave();
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        prefetchHandlers.onFocus();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        prefetchHandlers.onTouchStart();
        onTouchStart?.(e);
      }}
      onMouseDown={(e) => {
        persistPreview();
        onMouseDown?.(e);
      }}
      onClick={(e) => {
        persistPreview();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
