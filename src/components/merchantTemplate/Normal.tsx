import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import MerchantRichHtml from "@/components/merchant/MerchantRichHtml";
import { MerchantLogoOrInitial } from "@/components/merchant/MerchantLogoOrInitial";
import MerchantStoreProductCard from "@/components/merchant/MerchantStoreProductCard";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { Product } from "@/types/product";
import { stripHtmlForMeta } from "@/util/merchantRichText";
import { StorefrontReelsGallery } from "@/components/reels/StorefrontReelsGallery";

export default function NormalMerchantPage() {
  const router = useRouter();
  const { merchantSlug } = router.query;
  const [activeTab, setActiveTab] = useState("products");
  const { merchants, isLoading, merchantProfile } = useAppSelector(
    (state) => state.products
  );

  // Use merchantProfile first, fallback to merchants
  // Data is fetched by the parent page component
  const merchantData = merchantProfile || merchants;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!merchantData || !merchantData.merchant_details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Merchant not found</p>
      </div>
    );
  }

  const merchantReels = merchantData.merchant_details.merchant_reels ?? [];
  const hasMerchantReels = merchantReels.length > 0;
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Enhanced function to check if a color is light or dark with better edge case handling
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Special handling for yellow and other bright colors
    const isYellow = r > 200 && g > 200 && b < 100;
    const isBrightColor = r > 200 && g > 200 && b > 200;
    const isOrange = r > 200 && g > 150 && g < 200 && b < 100;
    const isCyan = r < 100 && g > 200 && b > 200;
    const isLime = r > 150 && g > 200 && b < 100;

    // For these bright colors, we need dark text even if luminance is high
    if (isYellow || isBrightColor || isOrange || isCyan || isLime) {
      return true; // Force dark text
    }

    return luminance > 0.5;
  };

  // Function to get optimal text color based on background
  const getOptimalTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate contrast ratios
    const getContrastRatio = (
      r1: number,
      g1: number,
      b1: number,
      r2: number,
      g2: number,
      b2: number
    ) => {
      const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const l1 = getLuminance(r1, g1, b1);
      const l2 = getLuminance(r2, g2, b2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    // Test contrast with white and black text
    const whiteContrast = getContrastRatio(r, g, b, 255, 255, 255);
    const blackContrast = getContrastRatio(r, g, b, 0, 0, 0);

    // Use the text color with better contrast (minimum 4.5:1 for AA compliance)
    if (whiteContrast >= 4.5 && whiteContrast > blackContrast) {
      return "#ffffff";
    } else if (blackContrast >= 4.5) {
      return "#1f2937";
    } else {
      // Fallback: use the better contrast ratio even if below 4.5
      return whiteContrast > blackContrast ? "#ffffff" : "#1f2937";
    }
  };

  // Function to darken a color for better contrast
  const darkenColor = (hex: string, amount: number) => {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const primaryColor = merchantData?.merchant_details?.primary_color || "#88AA17";
  const isLight = isLightColor(primaryColor);
  const textColor = getOptimalTextColor(primaryColor);
  const hoverTextColor = isLight ? "#374151" : "#f3f4f6";

  // For very bright colors like yellow, use a darker version for better contrast
  const r = parseInt(primaryColor.slice(1, 3), 16);
  const g = parseInt(primaryColor.slice(3, 5), 16);
  const b = parseInt(primaryColor.slice(5, 7), 16);
  const isVeryBright = r > 220 && g > 220 && b < 150; // Very bright yellow/lime colors

  const adjustedPrimaryColor = isVeryBright
    ? darkenColor(primaryColor, 40)
    : primaryColor;

  // Create better contrast colors for different elements
  const getHeadingColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // For very bright colors, use a much darker version for headings
    if (r > 200 && g > 200 && b < 150) {
      return darkenColor(hex, 80); // Much darker for yellow/lime
    } else if (r > 200 && g > 200 && b > 200) {
      return darkenColor(hex, 60); // Darker for very bright colors
    } else if (r > 180 && g > 180) {
      return darkenColor(hex, 50); // Darker for bright colors
    }

    return hex; // Use original for normal colors
  };

  const headingColor = getHeadingColor(primaryColor);

  const banners = merchantData?.banners;
  const bannerImageUrl =
    Array.isArray(banners) &&
    banners.length > 0 &&
    typeof banners[0]?.image?.full_size === "string" &&
    banners[0].image.full_size.trim() !== ""
      ? banners[0].image.full_size.trim()
      : null;

  const bannerPatternSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>
            {merchantData?.merchant_details?.store_name} | Merchant
          </title>
          <meta
            name="description"
            content={stripHtmlForMeta(merchantData?.merchant_details?.about, 160)}
          />
          <style>
            {`
              .merchant-primary {
                background-color: ${adjustedPrimaryColor};
                color: ${textColor};
              }
              .merchant-primary-text {
                color: ${primaryColor};
              }
              .merchant-heading-text {
                color: ${headingColor};
              }
              .merchant-primary-border {
                border-color: ${primaryColor};
              }
              .merchant-primary-hover:hover {
                background-color: ${hexToRgba(adjustedPrimaryColor, 0.9)};
                color: ${textColor};
              }
              .merchant-gradient {
                background: linear-gradient(135deg, ${adjustedPrimaryColor} 0%, ${hexToRgba(
              adjustedPrimaryColor,
              0.8
            )} 100%);
                color: ${textColor};
              }
              .merchant-text-on-primary {
                color: ${textColor};
              }
              .merchant-text-shadow {
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
              }
              .merchant-text-shadow-strong {
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
              }
              .merchant-icon-enhanced {
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
              }
              .merchant-icon-strong {
                filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
              }
              .merchant-button {
                background-color: ${adjustedPrimaryColor};
                color: ${textColor};
                border: 1px solid ${adjustedPrimaryColor};
              }
              .merchant-button:hover {
                background-color: ${hexToRgba(adjustedPrimaryColor, 0.9)};
                color: ${textColor};
              }
              .merchant-button-outline {
                background-color: transparent;
                color: ${primaryColor};
                border: 2px solid ${primaryColor};
                position: relative;
                overflow: hidden;
              }
              .merchant-button-outline::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: ${primaryColor};
                opacity: 0;
                transition: opacity 0.2s ease;
              }
              .merchant-button-outline:hover::before {
                opacity: 0.1;
              }
              .merchant-button-outline:hover {
                background-color: ${hexToRgba(primaryColor, 0.1)};
                border-color: ${adjustedPrimaryColor};
                color: ${adjustedPrimaryColor};
              }
              .merchant-button-outline:focus {
                outline: 2px solid ${hexToRgba(primaryColor, 0.3)};
                outline-offset: 2px;
              }
              .merchant-button-outline svg {
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
              }
            `}
          </style>
        </Head>

        {/* Banner Section — image or neutral gradient when no banner asset */}
        <div className="relative h-64 w-full overflow-hidden md:h-80">
          {bannerImageUrl ? (
            <img
              src={bannerImageUrl}
              alt={merchantData?.merchant_details?.store_name ?? "Store banner"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{ backgroundImage: bannerPatternSvg }}
              />
            </>
          )}
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              bannerImageUrl ? "bg-black/30" : "bg-black/10"
            }`}
          >
            <div className="mx-auto max-w-4xl px-4 text-center">
              <h1 className="text-4xl font-bold text-white drop-shadow-md md:text-5xl">
                {merchantData?.merchant_details?.store_name}
              </h1>
              <div className="mt-2 text-xl text-white prose prose-invert max-w-none drop-shadow prose-p:mb-2 prose-p:last:mb-0">
                <MerchantRichHtml html={merchantData?.merchant_details?.store_page_subtitle} />
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Info Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="self-start overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:sticky md:top-24">
                {/* Merchant Logo */}
                <div className="p-6 flex justify-center bg-gradient-to-br from-gray-50 to-white">
                  <div className="relative">
                    <MerchantLogoOrInitial
                      logoUrl={merchantData?.merchant_details?.logo}
                      storeName={merchantData?.merchant_details?.store_name ?? "Store"}
                      primaryColor={merchantData?.merchant_details?.primary_color}
                      alt={merchantData?.merchant_details?.store_name ?? ""}
                      className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white shadow-2xl ring-4 ring-gray-100"
                      imgClassName="h-full w-full object-cover"
                      fallbackTextClassName="text-3xl font-bold"
                    />
                    {merchantData?.merchant_details?.is_active && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                    )}
                  </div>
                </div>

                {/* Merchant Details */}
                <div className="p-6 border-t border-gray-100">
                  <h2 className="text-xl font-bold merchant-heading-text mb-2">
                    {merchantData?.merchant_details?.store_name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {merchantData?.merchant_details?.market?.help_text}{" "}
                    {merchantData?.merchant_details?.market?.name}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <svg
                          className="w-5 h-5 merchant-primary-text"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 flex-1">
                        {merchantData?.merchant_details?.store_address}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <svg
                          className="w-5 h-5 merchant-primary-text"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 flex-1">
                        {merchantData?.merchant_details?.support_phone_number}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <svg
                          className="w-5 h-5 merchant-primary-text"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 flex-1 break-all">
                        {merchantData?.merchant_details?.support_email}
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6">
                    <h3 className="font-medium merchant-heading-text mb-2">
                      Follow Us
                    </h3>
                    <div className="flex space-x-3">
                      {merchantData?.merchant_details?.facebook && (
                        <a
                          href={merchantData?.merchant_details?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-gray-100 p-2 transition"
                        >
                          <svg
                            className="w-5 h-5 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                          </svg>
                        </a>
                      )}
                      {merchantData?.merchant_details?.twitter && (
                        <a
                          href={merchantData?.merchant_details?.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-gray-100 p-2 transition"
                        >
                          <svg
                            className="w-5 h-5 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      {merchantData?.merchant_details?.instagram && (
                        <a
                          href={merchantData?.merchant_details?.instagram ?? ""}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-gray-100 p-2 transition"
                        >
                          <svg
                            className="w-5 h-5 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </a>
                      )}
                      {merchantData?.merchant_details?.tiktok && (
                        <a
                          href={merchantData?.merchant_details?.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-gray-100 p-2 transition"
                        >
                          <svg
                            className="w-5 h-5 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                <h3 className="text-lg font-bold merchant-heading-text mb-3">
                  {merchantData?.merchant_details?.about_title}
                </h3>
                <div className="prose prose-neutral max-w-none text-gray-700">
                  <MerchantRichHtml html={merchantData?.merchant_details?.about} />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="mt-1 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/[0.02] md:mt-0">
                <nav
                  role="tablist"
                  aria-label="Store sections"
                  className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 py-3.5 sm:gap-2.5 sm:px-5 sm:py-4"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "products"}
                    onClick={() => setActiveTab("products")}
                    className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                      activeTab === "products"
                        ? "merchant-button text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                    }`}
                  >
                    Products
                  </button>
                  {hasMerchantReels ? (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "reels"}
                      onClick={() => setActiveTab("reels")}
                      className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                        activeTab === "reels"
                          ? "merchant-button text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                      }`}
                    >
                      Reels
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "policy"}
                    onClick={() => setActiveTab("policy")}
                    className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                      activeTab === "policy"
                        ? "merchant-button text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                    }`}
                  >
                    Refund Policy
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "reviews"}
                    onClick={() => setActiveTab("reviews")}
                    className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                      activeTab === "reviews"
                        ? "merchant-button text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                    }`}
                  >
                    Reviews
                  </button>
                  {merchantData?.merchant_details?.is_allowed_to_stream && (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "live"}
                      onClick={() => setActiveTab("live")}
                      className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                        activeTab === "live"
                          ? "merchant-button text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                      }`}
                    >
                      Live Stream
                    </button>
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "shipping"}
                    onClick={() => setActiveTab("shipping")}
                    className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                      activeTab === "shipping"
                        ? "merchant-button text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/95 active:bg-slate-200"
                    }`}
                  >
                    Shipping Info
                  </button>
                </nav>

                <div
                  role="tabpanel"
                  className="min-h-0 border-t border-slate-100 px-4 py-6 sm:px-6 sm:py-8"
                >
                  {activeTab === "products" && (
                    <div>
                      <div className="merchant-heading-text mb-5 max-w-none text-xl font-bold leading-tight prose prose-neutral prose-p:inline prose-p:m-0 sm:mb-6 sm:text-2xl">
                        <MerchantRichHtml html={merchantData?.merchant_details?.store_page_title} />
                      </div>
                      {merchantData?.recent_products &&
                      merchantData.recent_products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                          {merchantData.recent_products.map((item) => (
                            <MerchantStoreProductCard
                              key={item.id}
                              product={item as Product}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-12 text-center text-sm text-slate-600 sm:py-14">
                          No products listed yet. Check back soon.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "reels" && hasMerchantReels ? (
                    <div>
                      <StorefrontReelsGallery
                        reels={merchantReels}
                        heading="Reels"
                        description="Curated videos from this store. Tap a card to watch full screen."
                        tone="subtle"
                      />
                    </div>
                  ) : null}

                  {activeTab === "policy" && (
                    <div>
                      <h2 className="mb-4 text-xl font-bold merchant-heading-text sm:text-2xl">
                        Refund Policy
                      </h2>
                      <div
                        className="prose prose-neutral max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{
                          __html: (
                            merchantData?.merchant_details?.refund_policy ?? ""
                          )
                            .replace(/\r\n/g, "<br/>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div>
                      <h2 className="mb-6 text-xl font-bold merchant-heading-text sm:text-2xl">
                        Customer Reviews
                      </h2>
                      <div className="space-y-0 divide-y divide-slate-100">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="py-5 first:pt-0">
                            <div className="mb-2 flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
                              <div className="min-w-0">
                                <h4 className="font-medium text-slate-900">
                                  John Doe
                                </h4>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((__, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < 4
                                          ? "text-amber-400"
                                          : "text-slate-200"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-[0.9375rem] leading-relaxed text-slate-600">
                              Great products and excellent customer service. Will
                              definitely buy again!
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "live" &&
                    merchantData?.merchant_details?.is_allowed_to_stream && (
                      <div className="overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-slate-900/30">
                        <div className="relative pt-[56.25%]">
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <div className="px-4 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <h3 className="mt-3 text-xl font-bold text-white">
                                Live Shopping Event
                              </h3>
                              <p className="mt-1 text-sm text-slate-300">
                                Next stream: Today at 3PM
                              </p>
                              <button
                                type="button"
                                className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  aria-hidden
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Set Reminder
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {activeTab === "shipping" && (
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 sm:p-5">
                      <h4 className="mb-3 text-base font-semibold merchant-primary-text">
                        Shipping Info
                      </h4>
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 merchant-primary-text"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          Usually ships within{" "}
                          {
                            merchantData?.merchant_details
                              ?.shipping_number_of_days
                          }{" "}
                          business days
                        </span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 merchant-primary-text"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>Contact for international shipping</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
