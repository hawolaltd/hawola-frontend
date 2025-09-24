import React, { useEffect, useState } from "react";
import { getMerchantProfile, getMerchants } from "@/redux/product/productSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useRouter } from "next/router";
import AuthLayout from "../layout/AuthLayout";
import Head from "next/head";
import { Product } from "@/types/product";

const StandardTemplate = () => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"products" | "about" | "policy">(
    "products"
  );

  const router = useRouter();
  const { merchantSlug, ...rest } = router.query;
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  const dispatch = useAppDispatch();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
    dispatch(getMerchantProfile(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    merchant_details,
    recent_products,
    merchant_categories,
    banners,
    home_page,
    is_streaming_now,
  } = data;

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

  // Function to get appropriate text color based on background
  const getTextColor = (backgroundColor: string): string => {
    return getOptimalTextColor(backgroundColor);
  };

  // Function to get appropriate border color based on background
  const getBorderColor = (backgroundColor: string): string => {
    return isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
  };

  // Function to get a darker shade for hover states
  const getDarkerShade = (color: string, percent: number = 20): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const darkerR = Math.max(0, r - (r * percent) / 100);
    const darkerG = Math.max(0, g - (g * percent) / 100);
    const darkerB = Math.max(0, b - (b * percent) / 100);

    return `#${Math.round(darkerR).toString(16).padStart(2, "0")}${Math.round(
      darkerG
    )
      .toString(16)
      .padStart(2, "0")}${Math.round(darkerB).toString(16).padStart(2, "0")}`;
  };

  // Function to convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const primaryColor = merchants?.merchant_details?.primary_color || "#010E26";
  const isPrimaryLight = isLightColor(primaryColor);
  const textColor = getTextColor(primaryColor);
  const borderColor = getBorderColor(primaryColor);
  const darkerPrimary = getDarkerShade(primaryColor, 15);
  const lighterBg = hexToRgba(primaryColor, 0.1);
  const mediumBg = hexToRgba(primaryColor, 0.2);

  // For very bright colors like yellow, use a darker version for better contrast
  const r = parseInt(primaryColor.slice(1, 3), 16);
  const g = parseInt(primaryColor.slice(3, 5), 16);
  const b = parseInt(primaryColor.slice(5, 7), 16);
  const isVeryBright = r > 220 && g > 220 && b < 150; // Very bright yellow/lime colors

  const adjustedPrimaryColor = isVeryBright
    ? getDarkerShade(primaryColor, 40)
    : primaryColor;

  // Create better contrast colors for different elements
  const getHeadingColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // For very bright colors, use a much darker version for headings
    if (r > 200 && g > 200 && b < 150) {
      return getDarkerShade(hex, 80); // Much darker for yellow/lime
    } else if (r > 200 && g > 200 && b > 200) {
      return getDarkerShade(hex, 60); // Darker for very bright colors
    } else if (r > 180 && g > 180) {
      return getDarkerShade(hex, 50); // Darker for bright colors
    }

    return hex; // Use original for normal colors
  };

  const headingColor = getHeadingColor(primaryColor);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(parseFloat(price));
  };

  const calculateDiscount = (price: string, discountPrice: string) => {
    const original = parseFloat(price);
    const discount = parseFloat(discountPrice);
    return Math.round(((original - discount) / original) * 100);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={
            product.featured_image[0]?.image?.full_size || "/placeholder.jpg"
          }
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount_price && product.discount_price !== product.price && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: primaryColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            -{calculateDiscount(product.price, product.discount_price)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 text-sm">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.discount_price || product.price)}
            </span>
            {product.discount_price &&
              product.discount_price !== product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-400">
              ({product.numReviews})
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const CategoryCard: React.FC<{ category: MerchantCategory }> = ({
    category,
  }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 text-center group cursor-pointer">
      <div
        className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        style={{
          backgroundColor: primaryColor,
          color: textColor,
        }}
      >
        {category.icon ? (
          <img
            src={category.icon}
            alt={category.name || "Category"}
            className="w-8 h-8 object-contain"
            style={{
              filter: isPrimaryLight ? "none" : "brightness(0) invert(1)",
            }}
          />
        ) : (
          <span className="text-2xl">🛍️</span>
        )}
      </div>
      <h3 className="font-semibold text-gray-800 truncate">
        {category.name || "Uncategorized"}
      </h3>
    </div>
  );

  return (
    <AuthLayout>
      <Head>
        <title>{data?.merchant_details?.store_name} | Minimalist Store</title>
        <meta
          name="description"
          content={data?.merchant_details?.about?.substring(0, 160)}
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
              background-color: ${darkerPrimary};
              color: ${getTextColor(darkerPrimary)};
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
            .merchant-tab-active {
              border-bottom-color: ${primaryColor} !important;
              color: ${headingColor} !important;
            }
            .merchant-badge {
              background-color: ${adjustedPrimaryColor};
              color: ${textColor};
              border: 1px solid ${borderColor};
            }
          `}
        </style>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Banner Section */}
        <div className="relative h-80 overflow-hidden">
          {banners?.length > 0 ? (
            <>
              <img
                src={banners[activeBannerIndex]?.image?.full_size}
                alt="Store Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="text-center" style={{ color: textColor }}>
                <h1 className="text-4xl font-bold mb-2">
                  {merchant_details?.store_name}
                </h1>
                <p className="text-xl opacity-90">
                  {merchant_details?.store_page_subtitle}
                </p>
              </div>
            </div>
          )}

          {/* Banner Navigation */}
          {banners?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeBannerIndex ? "scale-125" : "bg-opacity-50"
                  }`}
                  style={{
                    backgroundColor:
                      index === activeBannerIndex
                        ? isPrimaryLight
                          ? "#000000"
                          : "#FFFFFF"
                        : hexToRgba(
                            isPrimaryLight ? "#000000" : "#FFFFFF",
                            0.7
                          ),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Store Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={merchant_details?.logo}
                  alt={merchant_details?.store_name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                {is_streaming_now && (
                  <div
                    className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold animate-pulse merchant-badge"
                    style={{
                      backgroundColor: primaryColor,
                      color: textColor,
                    }}
                  >
                    LIVE
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {merchant_details?.store_name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>
                          {merchant_details?.merchant_level?.name} Merchant
                        </span>
                      </span>
                      <span>•</span>
                      <span>
                        {merchant_details?.location?.name},{" "}
                        {merchant_details?.state?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  {merchant_details?.store_page_subtitle}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span>🚚</span>
                    <span>
                      {merchant_details?.shipping_number_of_days} day delivery
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📞</span>
                    <span>{merchant_details?.support_phone_number}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>✉️</span>
                    <span>{merchant_details?.support_email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("products")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === "products"
                    ? "merchant-tab-active border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === "about"
                    ? "merchant-tab-active border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => setActiveTab("policy")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === "policy"
                    ? "merchant-tab-active border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Refund Policy
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-12">
            {activeTab === "products" && (
              <>
                {/* Categories */}
                {merchant_categories?.filter((cat) => cat.name).length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {merchant_categories
                        ?.filter((category) => category.name)
                        .map((category, index) => (
                          <CategoryCard
                            key={category.id || index}
                            category={category}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* Recent Products */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Recent Products
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recent_products?.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product as Product}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === "about" && (
              <section className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {merchant_details?.about_title}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {merchant_details?.about
                    ?.split("\r\n\r\n")
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Store Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm merchant-primary">
                        🏪
                      </div>
                      <span>{merchant_details?.store_address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm merchant-primary">
                        📍
                      </div>
                      <span>
                        {merchant_details?.location?.name},{" "}
                        {merchant_details?.state?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm merchant-primary">
                        📞
                      </div>
                      <span>{merchant_details?.support_phone_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm merchant-primary">
                        ✉️
                      </div>
                      <span>{merchant_details?.support_email}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "policy" && (
              <section className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Refund Policy
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {merchant_details?.refund_policy
                    ?.split("\r\n\r\n")
                    .map((paragraph, index) => (
                      <div key={index} className="mb-6">
                        {paragraph.split("\r\n").map((line, lineIndex) => (
                          <p key={lineIndex} className="mb-3 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StandardTemplate;
