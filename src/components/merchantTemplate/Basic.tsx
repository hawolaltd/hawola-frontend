import React, { useState, useRef, useEffect } from "react";
import { getMerchantProfile, getMerchants } from "@/redux/product/productSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useRouter } from "next/router";
import Head from "next/head";
import AuthLayout from "../layout/AuthLayout";

const BasicTemplate = () => {
  const [activeSection, setActiveSection] = useState<
    "overview" | "products" | "categories" | "about"
  >("overview");
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { merchantSlug, ...rest } = router.query;
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
    dispatch(getMerchantProfile(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  const {
    merchant_details,
    recent_products,
    merchant_categories,
    banners,
    home_page,
    is_streaming_now,
  } = data;

  // Improved color detection with better contrast ratios
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
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

  // Get optimal text color that meets WCAG AA standard (4.5:1)
  const getOptimalTextColor = (backgroundColor: string): string => {
    const whiteContrast = getContrastRatio(backgroundColor, "#FFFFFF");
    const blackContrast = getContrastRatio(backgroundColor, "#000000");

    // Prefer white text if both meet contrast, but prioritize better contrast
    if (whiteContrast >= 4.5 && blackContrast >= 4.5) {
      return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
    }
    if (whiteContrast >= 4.5) return "#FFFFFF";
    if (blackContrast >= 4.5) return "#000000";

    // If neither meets contrast, adjust the background color
    const luminance = getLuminance(backgroundColor);
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Get a contrasting version of the color for borders/accents
  const getContrastColor = (color: string): string => {
    const luminance = getLuminance(color);
    // For light colors, use a darker version; for dark colors, use a lighter version
    if (luminance > 0.6) {
      // Light color - return darker version
      return adjustColorBrightness(color, -40);
    } else {
      // Dark color - return lighter version
      return adjustColorBrightness(color, 60);
    }
  };

  // Adjust color brightness by percentage
  const adjustColorBrightness = (color: string, percent: number): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const adjust = (value: number) => {
      const adjusted = value + (value * percent) / 100;
      return Math.min(255, Math.max(0, Math.round(adjusted)));
    };

    return `#${adjust(r).toString(16).padStart(2, "0")}${adjust(g)
      .toString(16)
      .padStart(2, "0")}${adjust(b).toString(16).padStart(2, "0")}`;
  };

  // Get a hover color that maintains good contrast
  const getHoverColor = (color: string): string => {
    const luminance = getLuminance(color);
    return luminance > 0.6
      ? adjustColorBrightness(color, -15)
      : adjustColorBrightness(color, 15);
  };

  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const primaryColor = merchants?.merchant_details?.primary_color || "#010E26";
  const isLight = isLightColor(primaryColor);
  const textColor = getOptimalTextColor(primaryColor);
  const contrastColor = getContrastColor(primaryColor);
  const hoverColor = getHoverColor(primaryColor);
  const hoverTextColor = getOptimalTextColor(hoverColor);
  const lighterBg = hexToRgba(primaryColor, 0.1);
  const mediumBg = hexToRgba(primaryColor, 0.2);

  // For very bright colors like yellow, use a darker version for better contrast
  const r = parseInt(primaryColor.slice(1, 3), 16);
  const g = parseInt(primaryColor.slice(3, 5), 16);
  const b = parseInt(primaryColor.slice(5, 7), 16);
  const isVeryBright = r > 220 && g > 220 && b < 150; // Very bright yellow/lime colors

  const adjustedPrimaryColor = isVeryBright
    ? adjustColorBrightness(primaryColor, -40)
    : primaryColor;

  // Create better contrast colors for different elements
  const getHeadingColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // For very bright colors, use a much darker version for headings
    if (r > 200 && g > 200 && b < 150) {
      return adjustColorBrightness(hex, -80); // Much darker for yellow/lime
    } else if (r > 200 && g > 200 && b > 200) {
      return adjustColorBrightness(hex, -60); // Darker for very bright colors
    } else if (r > 180 && g > 180) {
      return adjustColorBrightness(hex, -50); // Darker for bright colors
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

  // Scroll handler for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setIsSticky(window.scrollY > headerRef.current.offsetHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const ProductGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recent_products.map((product) => (
        <div
          key={product.id}
          className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
        >
          <div className="relative overflow-hidden">
            <img
              src={product.featured_image[0]?.image.full_size}
              alt={product.name}
              className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            {product.discount_price &&
              product.discount_price !== product.price && (
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                  style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                    border: `2px solid ${contrastColor}`,
                  }}
                >
                  Sale
                </div>
              )}
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.discount_price || product.price)}
                </span>
                {product.discount_price &&
                  product.discount_price !== product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
              </div>

              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm text-gray-600">In Stock</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>⭐ {product.rating}</span>
                <span>({product.numReviews})</span>
              </div>
              <button
                className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                style={{
                  backgroundColor: primaryColor,
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hoverColor;
                  e.currentTarget.style.color = hoverTextColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primaryColor;
                  e.currentTarget.style.color = textColor;
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const CategoryShowcase = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {merchant_categories
        .filter((category) => category.name && category.id)
        .map((category) => (
          <div key={category.id} className="relative group cursor-pointer">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={category.icon || "/placeholder.jpg"}
                alt={category.name || "Category"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                style={{
                  background: `linear-gradient(to top, ${hexToRgba(
                    primaryColor,
                    0.7
                  )} 0%, transparent 100%)`,
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
                  {category.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/90 text-sm drop-shadow-md">
                    Shop Now
                  </span>
                  <span className="text-white text-lg drop-shadow-md">→</span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  const StatsSection = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm merchant-card-bg">
        <div className="text-3xl font-bold mb-2 merchant-heading-text">
          {recent_products.length}+
        </div>
        <div className="text-gray-600">Products</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm merchant-card-bg">
        <div className="text-3xl font-bold mb-2 merchant-heading-text">
          {merchant_categories.filter((c) => c.name).length}
        </div>
        <div className="text-gray-600">Categories</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm merchant-card-bg">
        <div className="text-3xl font-bold mb-2 merchant-heading-text">
          {recent_products.reduce(
            (acc, product) => acc + product.numReviews,
            0
          )}
          +
        </div>
        <div className="text-gray-600">Reviews</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm merchant-card-bg">
        <div className="text-3xl font-bold mb-2 merchant-heading-text">
          {merchant_details.shipping_number_of_days}
        </div>
        <div className="text-gray-600">Day Delivery</div>
      </div>
    </div>
  );

  return (
    <AuthLayout>
      <Head>
        <title>{merchant_details?.store_name} | Basic Store</title>
        <meta
          name="description"
          content={merchant_details?.about?.substring(0, 160)}
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
              border-color: ${contrastColor};
            }
            .merchant-primary-hover:hover {
              background-color: ${hoverColor};
              color: ${hoverTextColor};
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
            .merchant-card-bg {
              background-color: ${cardBackground};
            }
          `}
        </style>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section with Parallax Effect */}
        <div
          className="relative h-96 overflow-hidden"
          style={{
            backgroundImage:
              banners?.length > 0
                ? `url(${banners[0]?.image?.full_size})`
                : `linear-gradient(135deg, ${primaryColor}, ${adjustColorBrightness(
                    primaryColor,
                    -20
                  )})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="inline-flex items-center space-x-3 mb-4">
                <img
                  src={merchant_details?.logo}
                  alt={merchant_details?.store_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                    {merchant_details?.store_name}
                  </h1>
                </div>
              </div>

              <p className="text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                {merchant_details?.store_page_subtitle}
              </p>

              {is_streaming_now && (
                <div
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mt-4 animate-pulse shadow-lg"
                  style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                    border: `2px solid ${contrastColor}`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: textColor }}
                  />
                  <span className="font-semibold">Live Now</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Navigation */}
        <div
          ref={headerRef}
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isSticky
              ? "bg-white/95 backdrop-blur-md shadow-lg"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex justify-center space-x-8 py-4">
              {["overview", "products", "categories", "about"].map(
                (section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section as any)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      activeSection === section
                        ? "shadow-lg border-2"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                    style={{
                      backgroundColor:
                        activeSection === section ? primaryColor : undefined,
                      color: activeSection === section ? textColor : undefined,
                      borderColor:
                        activeSection === section
                          ? contrastColor
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== section) {
                        e.currentTarget.style.backgroundColor = hexToRgba(
                          primaryColor,
                          0.1
                        );
                        e.currentTarget.style.color = primaryColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== section) {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "";
                      }
                    }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-12">
              <StatsSection />

              {/* Featured Products Preview */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Featured Products
                  </h2>
                  <button
                    onClick={() => setActiveSection("products")}
                    className="font-medium flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200"
                    style={{ color: primaryColor }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = hexToRgba(
                        primaryColor,
                        0.1
                      );
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    <span>View All</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recent_products?.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={product.featured_image[0]?.image.full_size}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(
                              product.discount_price || product.price
                            )}
                          </span>
                          <span className="text-yellow-400">
                            ⭐ {product.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* About Preview */}
              <section className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  About {merchant_details?.store_name}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {merchant_details?.about?.split("\r\n\r\n")[0]}
                </p>
                <button
                  onClick={() => setActiveSection("about")}
                  className="px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                  style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                    border: `2px solid ${contrastColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverColor;
                    e.currentTarget.style.color = hoverTextColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.color = textColor;
                  }}
                >
                  Read More
                </button>
              </section>
            </div>
          )}

          {/* Products Section */}
          {activeSection === "products" && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  All Products
                </h2>
                <div className="text-gray-600">
                  Showing {recent_products?.length} products
                </div>
              </div>
              <ProductGrid />
            </section>
          )}

          {/* Categories Section */}
          {activeSection === "categories" && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Shop by Category
              </h2>
              <CategoryShowcase />
            </section>
          )}

          {/* About Section */}
          {activeSection === "about" && (
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${home_page?.first_image})` }}
                />

                <div className="p-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    {merchant_details?.about_title}
                  </h2>

                  <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                    {merchant_details?.about
                      ?.split("\r\n\r\n")
                      .map((paragraph, index) => (
                        <p key={index} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>

                  {/* Contact Information */}
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: "📍",
                          label: "Address",
                          value: merchant_details?.store_address,
                        },
                        {
                          icon: "📞",
                          label: "Phone",
                          value: merchant_details?.support_phone_number,
                        },
                        {
                          icon: "✉️",
                          label: "Email",
                          value: merchant_details?.support_email,
                        },
                        {
                          icon: "🚚",
                          label: "Delivery",
                          value: `${merchant_details?.shipping_number_of_days} days`,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                            style={{
                              backgroundColor: primaryColor,
                              color: textColor,
                            }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-gray-600">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex flex-col space-y-3">
            <button
              className="p-4 rounded-full shadow-lg transition-colors duration-200"
              style={{
                backgroundColor: primaryColor,
                color: textColor,
                border: `2px solid ${contrastColor}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverColor;
                e.currentTarget.style.color = hoverTextColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.color = textColor;
              }}
            >
              💬 Chat
            </button>
            <button
              className="p-4 rounded-full shadow-lg transition-colors duration-200"
              style={{
                backgroundColor: hexToRgba(primaryColor, 0.8),
                color: textColor,
                border: `2px solid ${contrastColor}`,
              }}
            >
              📞 Call
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default BasicTemplate;
