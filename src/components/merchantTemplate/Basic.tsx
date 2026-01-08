import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/hook/useReduxTypes";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import AuthLayout from "../layout/AuthLayout";
import { formatCurrency } from "@/util";

const BasicTemplate = () => {
  const [activeSection, setActiveSection] = useState<
    "overview" | "products" | "categories" | "about"
  >("overview");
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { merchantSlug } = router.query;
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  const merchantData = data || merchants;
  
  // Color utilities
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

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isYellow = r > 200 && g > 200 && b < 100;
    const isBrightColor = r > 200 && g > 200 && b > 200;
    if (isYellow || isBrightColor) return true;
    return luminance > 0.5;
  };

  const getOptimalTextColor = (backgroundColor: string): string => {
    const whiteContrast = getContrastRatio(backgroundColor, "#FFFFFF");
    const blackContrast = getContrastRatio(backgroundColor, "#000000");
    if (whiteContrast >= 4.5 && whiteContrast > blackContrast) return "#FFFFFF";
    if (blackContrast >= 4.5) return "#1F2937";
    const luminance = getLuminance(backgroundColor);
    return luminance > 0.5 ? "#1F2937" : "#FFFFFF";
  };

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

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const primaryColor = merchantData?.merchant_details?.primary_color || "#1F2937";
  const isLight = isLightColor(primaryColor);
  const textColor = getOptimalTextColor(primaryColor);
  const hoverColor = adjustColorBrightness(primaryColor, isLight ? -15 : 15);
  const hoverTextColor = getOptimalTextColor(hoverColor);
  const lighterBg = hexToRgba(primaryColor, 0.08);
  const headingColor = isLight ? adjustColorBrightness(primaryColor, -30) : "#FFFFFF";

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setIsSticky(window.scrollY > 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!merchantData) {
    return null;
  }
  
  const {
    merchant_details,
    recent_products,
    merchant_categories,
    banners,
    home_page,
    is_streaming_now,
  } = merchantData;

  return (
    <AuthLayout>
      <Head>
        <title>{merchant_details?.store_name} | Professional Store</title>
        <meta
          name="description"
          content={merchant_details?.about?.substring(0, 160)}
        />
        <style>
          {`
            .merchant-primary {
              background-color: ${primaryColor};
              color: ${textColor};
            }
            .merchant-primary-text {
              color: ${primaryColor};
            }
            .merchant-heading-text {
              color: ${headingColor};
            }
            .merchant-button {
              background-color: ${primaryColor};
              color: ${textColor};
            }
            .merchant-button:hover {
              background-color: ${hoverColor};
              color: ${hoverTextColor};
            }
            .merchant-light-bg {
              background-color: ${lighterBg};
            }
          `}
        </style>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Professional Header */}
        <header
          ref={headerRef}
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isSticky
              ? "bg-white shadow-md border-b border-gray-200"
              : "bg-white"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <img
                  src={merchant_details?.logo}
                  alt={merchant_details?.store_name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {merchant_details?.store_name}
                  </h1>
                  {merchant_details?.is_active && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Verified Store
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {["overview", "products", "categories", "about"].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeSection === section
                        ? "merchant-primary text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className={`relative overflow-hidden ${banners?.length > 0 ? 'h-[400px] md:h-[500px]' : 'h-[300px] md:h-[400px]'}`}>
          {banners?.length > 0 ? (
            <>
              <img
                src={banners[0]?.image?.full_size}
                alt="Store Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            </>
          ) : (
            <div
              className="w-full h-full relative"
              style={{
                background: `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, -40)} 0%, ${adjustColorBrightness(primaryColor, -50)} 50%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
              }}
            >
              {/* Pattern overlay for visual interest */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          )}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {merchant_details?.store_page_subtitle || merchant_details?.store_name || "Welcome to Our Store"}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow-md">
                  {merchant_details?.about?.substring(0, 150) || "Discover amazing products at great prices"}
                  {merchant_details?.about && merchant_details.about.length > 150 && "..."}
                </p>
                <button
                  onClick={() => setActiveSection("products")}
                  className="px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: banners?.length > 0 ? primaryColor : (isLight ? "#FFFFFF" : "#1F2937"),
                    color: banners?.length > 0 ? textColor : (isLight ? primaryColor : "#FFFFFF"),
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-16">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Products", value: recent_products?.length || 0, icon: "📦" },
                  { label: "Categories", value: merchant_categories?.filter((c) => c?.name).length || 0, icon: "🏷️" },
                  { label: "Reviews", value: recent_products?.reduce((acc, p) => acc + (p?.numReviews || 0), 0) || 0, icon: "⭐" },
                  { label: "Delivery", value: `${merchant_details?.shipping_number_of_days || 0} days`, icon: "🚚" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Featured Categories */}
              {merchant_categories?.filter((c) => c?.name).length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
                    <button
                      onClick={() => setActiveSection("categories")}
                      className="text-sm font-semibold merchant-primary-text hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  {(() => {
                    const categories = merchant_categories?.filter((c) => c?.name).slice(0, 8) || [];
                    const categoryCount = categories.length;
                    const useFlex = categoryCount < 8;
                    
                    return (
                      <div 
                        className={useFlex 
                          ? "flex flex-wrap justify-evenly gap-3 md:gap-4" 
                          : "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4"
                        }
                      >
                        {categories.map((category) => (
                        <Link
                          key={category.id}
                          href="#"
                          className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                        >
                          <div 
                            className="w-16 h-16 mb-3 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: lighterBg }}
                          >
                            {category.icon ? (
                              <img
                                src={category.icon}
                                alt={category.name || "Category"}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <span className="text-3xl">🏷️</span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:merchant-primary-text transition-colors">
                            {category.name}
                          </h3>
                        </Link>
                        ))}
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* Featured Products */}
              {recent_products && recent_products.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                    <button
                      onClick={() => setActiveSection("products")}
                      className="text-sm font-semibold merchant-primary-text hover:underline"
                    >
                      View All Products →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recent_products.slice(0, 8).map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={product.featured_image[0]?.image?.full_size || "/placeholder.jpg"}
                          alt={product.name || "Product"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discount_price && product.discount_price !== product.price && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-gray-700">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                          <span className="text-xs text-gray-600">
                            {product.rating || "0"} ({product.numReviews || 0})
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(product.discount_price || product.price)}
                          </span>
                          {product.discount_price && product.discount_price !== product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
              )}

              {/* About Preview */}
              <section className="bg-gray-50 rounded-2xl p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  About {merchant_details?.store_name}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {merchant_details?.about?.split("\r\n\r\n")[0] || merchant_details?.about?.substring(0, 300)}
                </p>
                <button
                  onClick={() => setActiveSection("about")}
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                  }}
                >
                  Learn More
                </button>
              </section>
            </div>
          )}

          {/* Products Section */}
          {activeSection === "products" && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
                <div className="text-gray-600">
                  {recent_products?.length || 0} products available
                </div>
              </div>
              {recent_products && recent_products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recent_products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={product.featured_image[0]?.image?.full_size || "/placeholder.jpg"}
                          alt={product.name || "Product"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      {product.discount_price && product.discount_price !== product.price && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        <span className="text-xs text-gray-600">
                          {product.rating || "0"} ({product.numReviews || 0})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && product.discount_price !== product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products available at the moment.</p>
                </div>
              )}
            </section>
          )}

          {/* Categories Section */}
          {activeSection === "categories" && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">All Categories</h2>
              {merchant_categories && merchant_categories.filter((c) => c?.name).length > 0 ? (
                (() => {
                  const categories = merchant_categories.filter((c) => c?.name);
                  const categoryCount = categories.length;
                  const useFlex = categoryCount < 8;
                  
                  return (
                    <div 
                      className={useFlex 
                        ? "flex flex-wrap justify-evenly gap-3 md:gap-4" 
                        : "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4"
                      }
                    >
                      {categories.map((category) => (
                    <Link
                      key={category.id}
                      href="#"
                      className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                    >
                      <div 
                        className="w-16 h-16 mb-3 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: lighterBg }}
                      >
                        {category.icon ? (
                          <img
                            src={category.icon}
                            alt={category.name || "Category"}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-3xl">🏷️</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:merchant-primary-text transition-colors">
                        {category.name}
                      </h3>
                    </Link>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No categories available at the moment.</p>
                </div>
              )}
            </section>
          )}

          {/* About Section */}
          {activeSection === "about" && (
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {home_page?.first_image && typeof home_page.first_image === 'string' ? (
                  <div
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url(${home_page.first_image})` }}
                  />
                ) : null}
                <div className="p-8 md:p-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    {merchant_details?.about_title || `About ${merchant_details?.store_name}`}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                    {merchant_details?.about
                      ?.split("\r\n\r\n")
                      .map((paragraph: string, index: number) => (
                        <p key={index} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>

                  {/* Contact Information */}
                  <div className="mt-12 grid md:grid-cols-2 gap-6">
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
                        label: "Delivery Time",
                        value: `${merchant_details?.shipping_number_of_days} days`,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            backgroundColor: primaryColor,
                            color: textColor,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {item.label}
                          </div>
                          <div className="text-gray-600 text-sm">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">{merchant_details?.store_name}</h3>
                <p className="text-gray-400 text-sm">
                  {merchant_details?.about?.substring(0, 150)}...
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <button onClick={() => setActiveSection("products")} className="hover:text-white">
                      Products
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveSection("categories")} className="hover:text-white">
                      Categories
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveSection("about")} className="hover:text-white">
                      About Us
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Contact</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>{merchant_details?.support_email}</li>
                  <li>{merchant_details?.support_phone_number}</li>
                  <li>{merchant_details?.store_address}</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              © {new Date().getFullYear()} {merchant_details?.store_name}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </AuthLayout>
  );
};

export default BasicTemplate;
