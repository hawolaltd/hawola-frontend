import React from "react";
import Image from "next/image";

interface Merchant {
  store_name: string;
  logo: string;
  primary_color: string;
  is_active: boolean;
  merchant_level: {
    name: string;
  };
  date_added: string;
}

interface DashboardHeaderProps {
  merchant: Merchant;
}

const DashboardHeader = ({ merchant }: DashboardHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-white shadow-lg ring-1 ring-gray-200/80">
      <div
        className="merchant-premium-accent-topbar absolute left-0 right-0 top-0 z-30"
        aria-hidden
      />
      {/* Background decoration */}
      <div className="absolute -translate-y-32 top-0 right-0 h-64 w-64 translate-x-32 rounded-full bg-slate-100/75 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-24 -translate-x-24 rounded-full bg-gray-100/80 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-8">
          {/* Store Info */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="relative">
              <div className="merchant-premium-logo-shell">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[0.875rem] bg-gray-50">
                  {merchant?.logo ? (
                    <Image
                      src={merchant.logo}
                      alt={merchant.store_name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-400"></div>
                  )}
                </div>
              </div>
              {merchant?.is_active && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Store Details */}
            <div>
              <h1 className="text-2xl font-bold merchant-heading-text">
                {merchant?.store_name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="merchant-btn-focus-visible merchant-outline-button inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none">
              <svg
                className="w-4 h-4 mr-2 merchant-icon-enhanced"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Follow
            </button>
            <button className="merchant-btn-focus-visible merchant-button inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none">
              <svg
                className="w-4 h-4 mr-2 merchant-icon-enhanced"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
