import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { getMerchantProfile, getMerchants } from "@/redux/product/productSlice";
import { capitalize, formatCurrency } from "@/util";

export default function NormalMerchantPage() {
  const router = useRouter();
  const { merchantSlug } = router.query;
  const [activeTab, setActiveTab] = useState("products");
  const dispatch = useAppDispatch();
  const { merchants, isLoading, merchantProfile } = useAppSelector(
    (state) => state.products
  );

  console.log("merchantProfile", merchantProfile);

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
    dispatch(getMerchantProfile(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!merchantProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Merchant not found</p>
      </div>
    );
  }

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

  const primaryColor = merchants?.merchant_details?.primary_color || "#88AA17";
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

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>
            {merchantProfile?.merchant_details?.store_name} | Merchant
          </title>
          <meta
            name="description"
            content={merchantProfile?.merchant_details?.about.substring(0, 160)}
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

        {/* Banner Section */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={merchantProfile?.banners?.[0]?.image?.full_size}
            alt={merchantProfile?.merchant_details?.store_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white">
                {merchantProfile?.merchant_details?.store_name}
              </h1>
              <p className="text-xl text-white mt-2">
                {merchants?.merchant_details?.store_page_subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Merchant Info Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Merchant Logo */}
                <div className="p-4 flex justify-center">
                  <img
                    src={merchantProfile?.merchant_details?.logo}
                    alt={merchants?.merchant_details?.store_name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>

                {/* Merchant Details */}
                <div className="p-4 border-t">
                  <h2 className="text-xl font-bold merchant-heading-text">
                    {merchantProfile?.merchant_details?.store_name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {merchantProfile?.merchant_details?.market.help_text}{" "}
                    {merchantProfile?.merchant_details?.market.name}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 merchant-primary-text mr-2"
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
                      <span>
                        {merchantProfile?.merchant_details?.store_address}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 merchant-primary-text mr-2"
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
                      <span>
                        {
                          merchantProfile?.merchant_details
                            ?.support_phone_number
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 merchant-primary-text mr-2"
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
                      <span>
                        {merchantProfile?.merchant_details?.support_email}
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6">
                    <h3 className="font-medium merchant-heading-text mb-2">
                      Follow Us
                    </h3>
                    <div className="flex space-x-3">
                      {merchantProfile?.merchant_details?.facebook && (
                        <a
                          href={merchantProfile?.merchant_details?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full merchant-light-bg transition"
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
                      {merchantProfile?.merchant_details?.twitter && (
                        <a
                          href={merchantProfile?.merchant_details?.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full merchant-light-bg transition"
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
                      {merchantProfile?.merchant_details?.instagram && (
                        <a
                          href={merchants?.merchant_details?.instagram ?? ""}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full merchant-light-bg transition"
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
                      {merchantProfile?.merchant_details?.tiktok && (
                        <a
                          href={merchantProfile?.merchant_details?.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full merchant-light-bg transition"
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
                  {merchantProfile?.merchant_details?.about_title}
                </h3>
                <p className="text-gray-700">
                  {merchantProfile?.merchant_details?.about}
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "products"
                        ? "merchant-heading-text merchant-primary-border"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab("policy")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "policy"
                        ? "merchant-heading-text merchant-primary-border"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Refund Policy
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "reviews"
                        ? "merchant-heading-text merchant-primary-border"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Reviews
                  </button>
                  {merchantProfile?.merchant_details?.is_allowed_to_stream && (
                    <button
                      onClick={() => setActiveTab("live")}
                      className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "live"
                          ? "merchant-heading-text merchant-primary-border"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Live Stream
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("shipping")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "shipping"
                        ? "merchant-heading-text merchant-primary-border"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Shipping Info
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6 h-[900px] overflow-x-hidden">
                {activeTab === "products" && (
                  <div>
                    <h2 className="text-2xl font-bold merchant-heading-text mb-6">
                      {merchantProfile?.merchant_details?.store_page_title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {merchantProfile?.recent_products?.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            <img
                              src={item?.featured_image?.[0]?.image?.full_size}
                              alt={item?.name}
                              className={"w-full h-full"}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-1">
                              {capitalize(item?.name)}
                            </h3>
                            {/*<p className="text-gray-600 text-sm mb-2">Description</p>*/}
                            <div className="flex justify-between items-center">
                              <span className="font-bold">
                                {formatCurrency(
                                  item?.discount_price
                                    ? item?.discount_price
                                    : item?.price
                                )}
                              </span>
                              <button className="px-3 py-1 rounded merchant-button text-sm">
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "policy" && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold merchant-heading-text mb-4">
                      Refund Policy
                    </h2>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: merchantProfile?.merchant_details?.refund_policy
                          .replace(/\r\n/g, "<br/>")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold merchant-heading-text mb-4">
                      Customer Reviews
                    </h2>
                    <div className="space-y-4">
                      {[...Array(5)].map((item, index) => (
                        <div key={index} className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                            <div>
                              <h4 className="font-medium">John Doe</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < 4
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">
                            Great products and excellent customer service. Will
                            definitely buy again!
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "live" &&
                  merchants?.merchant_details?.is_allowed_to_stream && (
                    <div className="mt-8 bg-black rounded-lg overflow-hidden">
                      <div className="relative pt-[56.25%]">
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="w-12 h-12 mx-auto text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <h3 className="text-xl font-bold text-white mt-2">
                              Live Shopping Event
                            </h3>
                            <p className="text-gray-300">
                              Next stream: Today at 3PM
                            </p>
                            <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center mx-auto">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
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
                  <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                    <h4 className="font-medium merchant-primary-text mb-2">
                      Shipping Info
                    </h4>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 merchant-primary-text mr-2"
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
                          merchantProfile?.merchant_details
                            ?.shipping_number_of_days
                        }{" "}
                        business days
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-5 h-5 merchant-primary-text mr-2"
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
    </AuthLayout>
  );
}
