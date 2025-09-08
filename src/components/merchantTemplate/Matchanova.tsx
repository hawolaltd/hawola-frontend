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
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function MatchanovaMerchantPage() {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!merchants) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-xl text-white">Merchant not found</p>
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

  const primaryColor = merchants?.merchant_details?.primary_color || "#22C55E";
  const lighterBg = hexToRgba(primaryColor, 0.1);

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-900">
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
              .merchant-gradient {
                background: linear-gradient(135deg, ${primaryColor} 0%, ${hexToRgba(
              primaryColor,
              0.8
            )} 100%);
              }
            `}
          </style>
        </Head>

        {/* Matchanova Hero Section */}
        <div className="relative h-screen overflow-hidden">
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
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent"></div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-center">
                <motion.div
                  className="inline-block mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src={merchantProfile?.merchant_details?.logo}
                    alt={merchants?.merchant_details?.store_name}
                    className="h-32 w-32 rounded-full object-cover shadow-2xl border-4 border-white/20"
                  />
                </motion.div>

                <motion.h1
                  className="text-6xl font-bold text-white mb-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {merchantProfile?.merchant_details?.store_name}
                </motion.h1>

                <motion.p
                  className="text-2xl text-green-200 mb-8 max-w-3xl mx-auto"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {merchants?.merchant_details?.store_page_subtitle}
                </motion.p>

                <motion.div
                  className="flex items-center justify-center space-x-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="merchant-gradient text-white text-sm font-medium px-6 py-3 rounded-full flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Premium Quality</span>
                  </span>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-6 py-3 rounded-full flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Verified Merchant</span>
                  </span>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-6 py-3 rounded-full">
                    {merchantProfile?.merchant_details?.merchant_level?.name}{" "}
                    Level
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300/30 rounded-full blur-lg"></div>
        </div>

        {/* Matchanova Navigation */}
        <div className="bg-black/50 backdrop-blur-md border-b border-green-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === "products"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-300 hover:text-white hover:border-green-500/50"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === "about"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-300 hover:text-white hover:border-green-500/50"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === "reviews"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-300 hover:text-white hover:border-green-500/50"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === "contact"
                    ? "merchant-primary-text merchant-primary-border"
                    : "border-transparent text-gray-300 hover:text-white hover:border-green-500/50"
                }`}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatePresence mode="wait">
            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold text-white mb-4">
                    {merchantProfile?.merchant_details?.store_page_title}
                  </h2>
                  <div className="flex items-center justify-center space-x-8 text-green-200">
                    <div className="flex items-center space-x-2">
                      <TruckIcon className="w-6 h-6" />
                      <span>Free shipping worldwide</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-6 h-6" />
                      <span>Secure & encrypted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GiftIcon className="w-6 h-6" />
                      <span>Premium packaging</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {merchantProfile?.recent_products?.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-3xl overflow-hidden hover:bg-gray-800/70 transition-all duration-500 group border border-green-500/20"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <div className="relative aspect-w-16 aspect-h-12 bg-gray-700 overflow-hidden">
                        <img
                          src={item?.featured_image?.[0]?.image?.full_size}
                          alt={item?.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <button className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                            <HeartIcon className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="merchant-gradient text-white text-xs font-medium px-3 py-1 rounded-full">
                            Premium
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-3 text-white group-hover:merchant-primary-text transition-colors">
                          {capitalize(item?.name)}
                        </h3>
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-5 h-5 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-500"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400 ml-2">
                            (4.8)
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-3xl font-bold merchant-primary-text">
                              {formatCurrency(
                                item?.discount_price
                                  ? item?.discount_price
                                  : item?.price
                              )}
                            </span>
                            {item?.discount_price && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {formatCurrency(item?.price)}
                              </span>
                            )}
                          </div>
                          <button className="merchant-gradient text-white px-8 py-4 rounded-2xl hover:opacity-90 transition-all duration-300 flex items-center space-x-2 font-medium">
                            <ShoppingCartIcon className="w-5 h-5" />
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="space-y-16"
              >
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-white mb-6">
                    {merchantProfile?.merchant_details?.about_title}
                  </h2>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                    {merchantProfile?.merchant_details?.about}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mb-6">
                      <TruckIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Lightning Fast Delivery
                    </h3>
                    <p className="text-gray-300">
                      Usually ships within{" "}
                      {
                        merchantProfile?.merchant_details
                          ?.shipping_number_of_days
                      }{" "}
                      business days with premium packaging
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mb-6">
                      <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Secure & Trusted
                    </h3>
                    <p className="text-gray-300">
                      Your payment information is encrypted and secure with our
                      advanced security protocols
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mb-6">
                      <GiftIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Premium Quality
                    </h3>
                    <p className="text-gray-300">
                      We curate only the finest products from trusted brands and
                      artisans worldwide
                    </p>
                  </motion.div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-green-500/20">
                  <h3 className="text-3xl font-bold text-white mb-8 text-center">
                    Store Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-6">
                        Contact Details
                      </h4>
                      <div className="space-y-4 text-gray-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
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
                          <span>
                            {merchantProfile?.merchant_details?.store_address}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
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
                          <span>
                            {
                              merchantProfile?.merchant_details
                                ?.support_phone_number
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
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
                          <span>
                            {merchantProfile?.merchant_details?.support_email ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-white mb-6">
                        Merchant Level
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Current Level</span>
                          <span className="text-xl font-bold merchant-primary-text">
                            {
                              merchantProfile?.merchant_details?.merchant_level
                                ?.name
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                          <div
                            className="h-4 rounded-full merchant-gradient"
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
                        <p className="text-sm text-gray-400">
                          {merchantProfile?.merchant_details?.merchant_level
                            ?.name === "Starter"
                            ? "Keep growing to reach the next level!"
                            : merchantProfile?.merchant_details?.merchant_level
                                ?.name === "Intermediate"
                            ? "You're doing great! Almost at the top level."
                            : "Congratulations! You've reached the highest level."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-green-500/20"
              >
                <h2 className="text-4xl font-bold text-white mb-12 text-center">
                  Customer Reviews
                </h2>
                <div className="space-y-8">
                  {[...Array(5)].map((_, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-700/50 rounded-2xl p-8 border border-green-500/10"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                          JD
                        </div>
                        <div className="ml-6">
                          <h4 className="text-xl font-semibold text-white">
                            John Doe
                          </h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-5 h-5 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-500"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-400 ml-2">
                              2 days ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        Absolutely amazing experience! The quality of the
                        products exceeded my expectations and the customer
                        service was outstanding. The packaging was beautiful and
                        the shipping was incredibly fast. I will definitely be
                        ordering again soon!
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-green-500/20"
              >
                <h2 className="text-4xl font-bold text-white mb-12 text-center">
                  Get in Touch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-8">
                      Contact Information
                    </h3>
                    <div className="space-y-8">
                      <div className="flex items-start">
                        <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                          <svg
                            className="w-8 h-8 text-white"
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
                          <h4 className="text-xl font-semibold text-white mb-2">
                            Address
                          </h4>
                          <p className="text-gray-300 text-lg">
                            {merchantProfile?.merchant_details?.store_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                          <svg
                            className="w-8 h-8 text-white"
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
                          <h4 className="text-xl font-semibold text-white mb-2">
                            Phone
                          </h4>
                          <p className="text-gray-300 text-lg">
                            {
                              merchantProfile?.merchant_details
                                ?.support_phone_number
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                          <svg
                            className="w-8 h-8 text-white"
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
                          <h4 className="text-xl font-semibold text-white mb-2">
                            Email
                          </h4>
                          <p className="text-gray-300 text-lg">
                            {merchantProfile?.merchant_details?.support_email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-8">
                      Follow Us
                    </h3>
                    <div className="flex space-x-6">
                      {merchantProfile?.merchant_details?.facebook && (
                        <a
                          href={merchantProfile?.merchant_details?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-8 h-8 text-white"
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
                          className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-8 h-8 text-white"
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
                          className="w-16 h-16 merchant-gradient rounded-2xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <svg
                            className="w-8 h-8 text-white"
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
