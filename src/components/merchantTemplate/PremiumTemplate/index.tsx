import React, { useMemo } from "react";
import DashboardHeader from "./DashboardHeader";
import MerchantStats from "./MerchantStats";
import BannerShowcase from "./BannerShowcase";
import CategoryGrid from "./CategoryGrid";
import ProductShowcase from "./ProductShowcase";
import StoreInfo from "./StoreInfo";
import { useAppSelector } from "@/hook/useReduxTypes";
import AuthLayout from "@/components/layout/AuthLayout";
import MerchantRichHtml from "@/components/merchant/MerchantRichHtml";
import Head from "next/head";
import { stripHtmlForMeta } from "@/util/merchantRichText";
import { buildMerchantBrandPalette } from "@/util/merchantBrandPalette";
import { buildPremiumMerchantInlineCss } from "@/util/premiumMerchantInlineCss";
import type { MerchantBannerImageSizes } from "@/util/merchantBanner";
import { StorefrontReelsGallery } from "@/components/reels/StorefrontReelsGallery";
import MerchantAboutWithSidebar from "@/components/merchantTemplate/MerchantAboutWithSidebar";

const DashboardTemplate = () => {
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);

  // Use data (merchantProfile) first, fallback to merchants
  // Data is fetched by the parent page component
  const merchantData = data || merchants;

  const brandPalette = useMemo(
    () =>
      buildMerchantBrandPalette(
        merchantData?.merchant_details?.primary_color ?? null,
        { fallback: "#3B82F6" }
      ),
    [merchantData?.merchant_details?.primary_color]
  );

  const premiumStyles = useMemo(
    () => buildPremiumMerchantInlineCss(brandPalette),
    [brandPalette]
  );

  const merchantReels = merchantData?.merchant_details?.merchant_reels ?? [];
  const hasMerchantReels = merchantReels.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />
          <p className="text-gray-600 text-lg">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  if (!merchantData || !merchantData.merchant_details) {
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
        <title>{merchantData?.merchant_details?.store_name} | Store Dashboard</title>
        <meta
          name="description"
          content={stripHtmlForMeta(merchantData?.merchant_details?.about, 160)}
        />
        <style>{premiumStyles}</style>
      </Head>
      <main
        className="relative min-h-screen bg-gray-50"
        style={brandPalette.cssVariables as React.CSSProperties}
      >
        <div
          className="merchant-premium-bg-mesh pointer-events-none absolute inset-0 isolate"
          aria-hidden
        />
        <div className="relative z-[1]">
        {/* Dashboard Header */}
        <DashboardHeader merchant={merchantData?.merchant_details} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                <MerchantStats
                  merchantLevel={merchantData?.merchant_details?.merchant_level?.name}
                  shippingDays={merchantData?.merchant_details?.shipping_number_of_days}
                  isActive={merchantData?.merchant_details?.is_active}
                  dateAdded={merchantData?.merchant_details?.date_added}
                  isStreaming={merchantData?.is_streaming_now}
                />
                <StoreInfo
                  address={merchantData?.merchant_details?.store_address}
                  phone={merchantData?.merchant_details?.support_phone_number}
                  email={merchantData?.merchant_details?.support_email}
                  location={merchantData?.merchant_details?.location?.name}
                  state={merchantData?.merchant_details?.state?.name}
                  market={merchantData?.merchant_details?.market?.name}
                  refundPolicy={merchantData?.merchant_details?.refund_policy}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Banner Showcase */}
              <div className="animate-fade-in">
                <BannerShowcase
                  banners={merchantData?.banners}
                  defaultBanner={
                    merchantData?.merchant_details?.default_banner as
                      | MerchantBannerImageSizes
                      | string
                      | null
                      | undefined
                  }
                  merchantBanner={
                    merchantData?.merchant_details?.merchant_banner as
                      | Array<{ id?: number; image?: MerchantBannerImageSizes }>
                      | undefined
                  }
                />
              </div>

              {/* Categories */}
              <div className="animate-fade-in delay-100">
                <CategoryGrid categories={merchantData?.merchant_categories as any} />
              </div>

              {/* Products */}
              <div className="animate-fade-in delay-200">
                <ProductShowcase
                  products={merchantData?.recent_products}
                  title={merchantData?.merchant_details?.store_page_title}
                  subtitle={merchantData?.merchant_details?.store_page_subtitle}
                />
              </div>

              {hasMerchantReels ? (
                <div className="animate-fade-in delay-300">
                  <div className="merchant-premium-section-shell p-6 sm:p-8">
                    <StorefrontReelsGallery
                      reels={merchantReels}
                      heading="Reels"
                      description="Scroll to explore videos from this store. Tap any reel to watch full screen."
                      tone="subtle"
                      layout="page"
                      merchantDetails={merchantData?.merchant_details}
                    />
                  </div>
                </div>
              ) : null}

              {/* About Section */}
              <div className="animate-fade-in delay-300">
                <div className="merchant-premium-section-shell p-6 sm:p-8">
                  <MerchantAboutWithSidebar details={merchantData?.merchant_details}>
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="merchant-gradient merchant-icon-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
                        <svg
                          className="h-6 w-6 merchant-text-on-primary merchant-text-shadow merchant-icon-strong"
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
                      <div className="min-w-0">
                        <h2 className="text-3xl font-bold merchant-heading-text">
                          {merchantData?.merchant_details?.about_title}
                        </h2>
                        <span className="merchant-premium-title-rule" aria-hidden />
                      </div>
                    </div>
                    <div className="prose prose-lg max-w-none leading-relaxed text-gray-600">
                      <MerchantRichHtml html={merchantData?.merchant_details?.about} />
                    </div>
                  </MerchantAboutWithSidebar>
                </div>
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
