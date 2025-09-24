import React, { useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import MerchantStats from "./MerchantStats";
import BannerShowcase from "./BannerShowcase";
import CategoryGrid from "./CategoryGrid";
import ProductShowcase from "./ProductShowcase";
import StoreInfo from "./StoreInfo";
import SocialMedia from "./SocialMedia";
import Newsletter from "@/components/Newsletter";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import AuthLayout from "@/components/layout/AuthLayout";
import Head from "next/head";
import { getMerchantProfile, getMerchants } from "@/redux/product/productSlice";
import { useRouter } from "next/router";

const DashboardTemplate = () => {
  const router = useRouter();
  const { merchantSlug, ...rest } = router.query;
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  const dispatch = useAppDispatch();

  // Function to convert hex to rgba with opacity
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
    // Yellow has high luminance but poor contrast with white text
    const isYellow = r > 200 && g > 200 && b < 100;
    const isBrightColor = r > 200 && g > 200 && b > 200; // Very bright colors
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

  const primaryColor = data?.merchant_details?.primary_color || "#3B82F6";
  const isLight = isLightColor(primaryColor);
  const lighterBg = hexToRgba(primaryColor, 0.1);
  const mediumBg = hexToRgba(primaryColor, 0.2);
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

  // Create subtle background variations for cards
  const getCardBackground = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // For very bright colors, use a very subtle tint
    if (r > 200 && g > 200 && b < 150) {
      return hexToRgba(hex, 0.03); // Very subtle for yellow
    } else if (r > 200 && g > 200 && b > 200) {
      return hexToRgba(hex, 0.05); // Subtle for very bright colors
    }

    return hexToRgba(hex, 0.08); // Normal subtle tint
  };

  const cardBackground = getCardBackground(primaryColor);

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
    dispatch(getMerchantProfile(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-xl text-gray-600">Store not found</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <Head>
        <title>{data?.merchant_details?.store_name} | Store Dashboard</title>
        <meta
          name="description"
          content={data?.merchant_details?.about.substring(0, 160)}
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
            .merchant-light-bg {
              background-color: ${lighterBg};
            }
            .merchant-medium-bg {
              background-color: ${mediumBg};
            }
            .merchant-gradient {
              background: linear-gradient(135deg, ${adjustedPrimaryColor} 0%, ${hexToRgba(
            adjustedPrimaryColor,
            0.8
          )} 100%);
              color: ${textColor};
            }
            .merchant-gradient-light {
              background: linear-gradient(135deg, ${lighterBg} 0%, ${mediumBg} 100%);
            }
            .merchant-text-on-primary {
              color: ${textColor};
            }
            .merchant-text-on-primary-hover:hover {
              color: ${hoverTextColor};
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
              border: 1px solid ${primaryColor};
            }
            .merchant-button-outline:hover {
              background-color: ${adjustedPrimaryColor};
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
            .merchant-outline-button {
              border: 2px solid ${primaryColor};
              color: ${primaryColor};
              background-color: transparent;
              position: relative;
              overflow: hidden;
            }
            .merchant-outline-button::before {
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
            .merchant-outline-button:hover::before {
              opacity: 0.1;
            }
            .merchant-outline-button:hover {
              background-color: ${hexToRgba(primaryColor, 0.1)};
              border-color: ${adjustedPrimaryColor};
              color: ${adjustedPrimaryColor};
            }
            .merchant-outline-button:focus {
              outline: 2px solid ${hexToRgba(primaryColor, 0.3)};
              outline-offset: 2px;
            }
            .merchant-border-subtle {
              border: 1px solid ${hexToRgba(primaryColor, 0.2)};
            }
            .merchant-border-strong {
              border: 1px solid ${hexToRgba(primaryColor, 0.4)};
            }
            .merchant-card-bg {
              background-color: ${cardBackground};
            }
            .merchant-card-bg-subtle {
              background-color: ${hexToRgba(primaryColor, 0.02)};
            }
            .merchant-icon-container {
              position: relative;
            }
            .merchant-icon-container::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, ${hexToRgba(
                primaryColor,
                0.1
              )} 0%, transparent 70%);
              border-radius: inherit;
              pointer-events: none;
            }
            .merchant-outline-button svg {
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
            }
            .scrollbar-thin {
              scrollbar-width: thin;
            }
            .scrollbar-thin::-webkit-scrollbar {
              height: 6px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
              background: #d1d5db;
            }
            .scrollbar-track-gray-100::-webkit-scrollbar-track {
              background: #f3f4f6;
            }
          `}
        </style>
      </Head>
      <main className="min-h-screen merchant-gradient-light">
        {/* Dashboard Header */}
        <DashboardHeader merchant={data?.merchant_details} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                <MerchantStats
                  merchantLevel={data?.merchant_details?.merchant_level?.name}
                  shippingDays={data?.merchant_details?.shipping_number_of_days}
                  isActive={data?.merchant_details?.is_active}
                  dateAdded={data?.merchant_details?.date_added}
                  isStreaming={data?.is_streaming_now}
                />
                <StoreInfo
                  address={data?.merchant_details?.store_address}
                  phone={data?.merchant_details?.support_phone_number}
                  email={data?.merchant_details?.support_email}
                  location={data?.merchant_details?.location?.name}
                  state={data?.merchant_details?.state?.name}
                  market={data?.merchant_details?.market?.name}
                  refundPolicy={data?.merchant_details?.refund_policy}
                />
                <SocialMedia
                  facebook={data?.merchant_details?.facebook}
                  twitter={data?.merchant_details?.twitter}
                  instagram={data?.merchant_details?.instagram}
                  tiktok={data?.merchant_details?.tiktok}
                  linkedin={data?.merchant_details?.linkedin}
                  youtube={data?.merchant_details?.youtube}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Banner Showcase */}
              <div className="animate-fade-in">
                <BannerShowcase
                  banners={data?.banners}
                  defaultBanner={data?.merchant_details?.default_banner as any}
                  merchantBanner={data?.merchant_details?.merchant_banner}
                />
              </div>

              {/* Categories */}
              <div className="animate-fade-in delay-100">
                <CategoryGrid categories={data?.merchant_categories as any} />
              </div>

              {/* Products */}
              <div className="animate-fade-in delay-200">
                <ProductShowcase
                  products={data?.recent_products}
                  title={data?.merchant_details?.store_page_title}
                  subtitle={data?.merchant_details?.store_page_subtitle}
                />
              </div>

              {/* About Section */}
              <div className="animate-fade-in delay-300">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 merchant-card-bg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center merchant-icon-container">
                      <svg
                        className="w-6 h-6 merchant-text-on-primary merchant-text-shadow merchant-icon-strong"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold merchant-heading-text">
                      {data?.merchant_details?.about_title}
                    </h2>
                  </div>
                  <div
                    className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: data?.merchant_details?.about
                        .replace(/\r\n/g, "<br>")
                        .replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
};

export default DashboardTemplate;
