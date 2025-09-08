import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "@/components/layout/AuthLayout";
import { getMerchants } from "@/redux/product/productSlice";
import { capitalize, formatCurrency } from "@/util";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  GiftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ModernMerchantPage() {
  const router = useRouter();
  const { merchantSlug } = router.query;
  const [activeTab, setActiveTab] = useState("products");
  const dispatch = useAppDispatch();
  const { merchants, isLoading, merchantProfile } = useAppSelector(
    (state) => state.products
  );

  console.log("merchants", merchants);

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!merchants) {
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

  const primaryColor = merchants?.merchant_details?.primary_color || "#0D9488";
  const lighterBg = hexToRgba(primaryColor, 0.1);

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

        {/* Modern Hero Section */}
        <div className="relative h-96 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
          <AnimatePresence>
            <motion.img
              key={
                (merchantProfile?.banners?.[0] as any)?.image?.full_size ||
                "banner"
              }
              src={
                (merchantProfile?.banners?.[0] as any)?.image?.full_size ||
                "/default-banner.jpg"
              }
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex items-center space-x-6">
                <motion.img
                  src={merchantProfile?.merchant_details?.logo}
                  alt={merchants?.merchant_details?.store_name}
                  className="h-24 w-24 rounded-2xl object-cover shadow-2xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
                <div>
                  <motion.h1
                    className="text-4xl font-bold text-white mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {merchantProfile?.merchant_details?.store_name}
                  </motion.h1>
                  <motion.p
                    className="text-xl text-gray-200"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {merchants?.merchant_details?.store_page_subtitle}
                  </motion.p>
                  <motion.div
                    className="flex items-center space-x-4 mt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="merchant-light-bg merchant-primary-text text-sm font-medium px-4 py-2 rounded-full">
                      <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                      Verified
                    </span>
                    <span className="text-gray-300 text-sm">
                      {merchantProfile?.merchant_details?.merchant_level?.name}{" "}
                      Level
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "products"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "about"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "reviews"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "contact"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {merchantProfile?.merchant_details?.store_page_title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <TruckIcon className="w-5 h-5" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {merchantProfile?.recent_products?.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative aspect-w-16 aspect-h-12 bg-gray-200 overflow-hidden">
                        <img
                          src={item?.featured_image?.[0]?.image?.full_size}
                          alt={item?.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                            <HeartIcon className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:merchant-primary-text transition-colors">
                          {capitalize(item?.name)}
                        </h3>
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            (4.0)
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold merchant-primary-text">
                              {formatCurrency(
                                item?.discount_price
                                  ? item?.discount_price
                                  : item?.price
                              )}
                            </span>
                            {item?.discount_price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {formatCurrency(item?.price)}
                              </span>
                            )}
                          </div>
                          <button className="merchant-primary text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center space-x-2">
                            <ShoppingCartIcon className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {merchantProfile?.merchant_details?.about_title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {merchantProfile?.merchant_details?.about}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mb-4">
                      <TruckIcon className="w-6 h-6 merchant-primary-text" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Fast Shipping
                    </h3>
                    <p className="text-gray-600">
                      Usually ships within{" "}
                      {
                        merchantProfile?.merchant_details
                          ?.shipping_number_of_days
                      }{" "}
                      business days
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheckIcon className="w-6 h-6 merchant-primary-text" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Secure Payment
                    </h3>
                    <p className="text-gray-600">
                      Your payment information is safe and secure with us
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mb-4">
                      <GiftIcon className="w-6 h-6 merchant-primary-text" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Quality Products
                    </h3>
                    <p className="text-gray-600">
                      We only sell high-quality products from trusted brands
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Store Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Contact Details
                      </h4>
                      <div className="space-y-2 text-gray-600">
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {merchantProfile?.merchant_details?.store_address}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {
                            merchantProfile?.merchant_details
                              ?.support_phone_number
                          }
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {merchantProfile?.merchant_details?.support_email ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Merchant Level
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level</span>
                          <span className="font-medium merchant-primary-text">
                            {
                              merchantProfile?.merchant_details?.merchant_level
                                ?.name
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full merchant-primary"
                            style={{
                              width:
                                merchantProfile?.merchant_details
                                  ?.merchant_level?.name === "Starter"
                                  ? "33%"
                                  : merchantProfile?.merchant_details
                                      ?.merchant_level?.name === "Intermediate"
                                  ? "66%"
                                  : "100%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Customer Reviews
                </h2>
                <div className="space-y-6">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                          JD
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold text-gray-900">
                            John Doe
                          </h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">
                              2 days ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Great products and excellent customer service. The
                        quality exceeded my expectations and the shipping was
                        very fast. Will definitely buy again!
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Get in Touch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Contact Information
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Address
                          </h4>
                          <p className="text-gray-600">
                            {merchantProfile?.merchant_details?.store_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Phone
                          </h4>
                          <p className="text-gray-600">
                            {
                              merchantProfile?.merchant_details
                                ?.support_phone_number
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Email
                          </h4>
                          <p className="text-gray-600">
                            {merchantProfile?.merchant_details?.support_email ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Follow Us
                    </h3>
                    <div className="flex space-x-4">
                      {merchantProfile?.merchant_details?.facebook && (
                        <a
                          href={merchantProfile?.merchant_details?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
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
                          className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      {merchantProfile?.merchant_details?.instagram && (
                        <a
                          href={merchants?.merchant_details?.instagram || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 merchant-light-bg rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-6 h-6 merchant-primary-text"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthLayout>
  );
}
