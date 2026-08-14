import Link from "next/link";
import React from "react";
import type { AdvertBanner, Banner, HeroCreativeSlide } from "@/types/home";
import { merchantStorePublicPath } from "@/util/merchantPublicPath";

export function isExternalHref(href: string | null): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}

export function bannerImageSrc(b: Banner): string {
  const w = b.web_banner_image as string | undefined;
  const m = b.mobile_banner_image as string | undefined;
  const legacy = b.banner_image as string | undefined;
  return (w || m || legacy || "") as string;
}

export function bannerToSlide(b: Banner): HeroCreativeSlide {
  const href =
    b.url && String(b.url).trim()
      ? String(b.url).trim()
      : b.product?.slug
        ? `/product/${b.product.slug}`
        : null;
  return {
    key: `banner-${b.id}`,
    image: bannerImageSrc(b),
    href,
    external: isExternalHref(href),
  };
}

export function advertImageSrc(a: AdvertBanner): string {
  return (a.web_banner_image || a.web_image || a.image || a.banner_image || "") as string;
}

export function advertToSlide(a: AdvertBanner): HeroCreativeSlide {
  let href: string | null = null;
  if (a.url && String(a.url).trim()) href = String(a.url).trim();
  else if (a.product?.slug) href = `/product/${a.product.slug}`;
  else if (a.merchant?.slug) href = merchantStorePublicPath(a.merchant.slug);
  return {
    key: `advert-${a.id}`,
    image: advertImageSrc(a),
    href,
    external: isExternalHref(href) || Boolean(a.merchant?.slug),
  };
}

export function SlideLink({
  slide,
  className,
  children,
  ariaLabel = "Open promotion",
}: {
  slide: HeroCreativeSlide;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}) {
  if (!slide.href) return <>{children}</>;
  if (slide.external) {
    return (
      <a
        href={slide.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={slide.href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
