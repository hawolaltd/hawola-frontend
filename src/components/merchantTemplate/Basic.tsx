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
  const [scrollY, setScrollY] = useState(0);

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

  // Function to convert hex to rgba with opacity (same as Normal template)
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const primaryColor = merchants?.merchant_details?.primary_color || "#010E26";
  const lighterBg = hexToRgba(primaryColor, 0.1);

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
                  className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                  style={{ background: primaryColor }}
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
                className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors duration-200 text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
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
                    0.8
                  )} 0%, transparent 100%)`,
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg truncate">
                  {category.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/80 text-sm">Shop Now</span>
                  <span className="text-white text-lg">→</span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  const StatsSection = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
        <div
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          {recent_products.length}+
        </div>
        <div className="text-gray-600">Products</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
        <div
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          {merchant_categories.filter((c) => c.name).length}
        </div>
        <div className="text-gray-600">Categories</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
        <div
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          {recent_products.reduce(
            (acc, product) => acc + product.numReviews,
            0
          )}
          +
        </div>
        <div className="text-gray-600">Reviews</div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
        <div
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
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
              background-color: ${primaryColor};
            }
            .merchant-primary-text {
              color: ${primaryColor};
            }
            .merchant-primary-border {
              border-color: ${primaryColor};
            }
            .merchant-primary-hover:hover {
              background-color: ${hexToRgba(primaryColor, 0.9)};
            }
            .merchant-light-bg {
              background-color: ${lighterBg};
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
                : `linear-gradient(135deg, ${primaryColor}, #1a365d)`,
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {merchant_details?.store_name}
                  </h1>
                </div>
              </div>

              <p className="text-xl max-w-2xl mx-auto leading-relaxed">
                {merchant_details?.store_page_subtitle}
              </p>

              {is_streaming_now && (
                <div
                  className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-full mt-4 animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
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
                        ? "text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                    style={{
                      backgroundColor:
                        activeSection === section ? primaryColor : undefined,
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
                    className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 merchant-primary-hover px-4 py-2 rounded-lg"
                    style={{ color: primaryColor }}
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
                  className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
                  style={{ backgroundColor: primaryColor }}
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
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          📍
                        </div>
                        <div>
                          <div className="font-medium">Address</div>
                          <div className="text-gray-600">
                            {merchant_details?.store_address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          📞
                        </div>
                        <div>
                          <div className="font-medium">Phone</div>
                          <div className="text-gray-600">
                            {merchant_details?.support_phone_number}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          ✉️
                        </div>
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-gray-600">
                            {merchant_details?.support_email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          🚚
                        </div>
                        <div>
                          <div className="font-medium">Delivery</div>
                          <div className="text-gray-600">
                            {merchant_details?.shipping_number_of_days} days
                          </div>
                        </div>
                      </div>
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
              className="text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-colors duration-200"
              style={{ backgroundColor: primaryColor }}
            >
              💬 Chat
            </button>
            <button
              className="text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-colors duration-200"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.8) }}
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
