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

  const primaryColor = data?.merchant_details?.primary_color || "#3B82F6";
  const lighterBg = hexToRgba(primaryColor, 0.1);
  const mediumBg = hexToRgba(primaryColor, 0.2);

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
            .merchant-medium-bg {
              background-color: ${mediumBg};
            }
            .merchant-gradient {
              background: linear-gradient(135deg, ${primaryColor} 0%, ${hexToRgba(
            primaryColor,
            0.8
          )} 100%);
            }
            .merchant-gradient-light {
              background: linear-gradient(135deg, ${lighterBg} 0%, ${mediumBg} 100%);
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
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 merchant-gradient rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <h2 className="text-3xl font-bold merchant-primary-text">
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
