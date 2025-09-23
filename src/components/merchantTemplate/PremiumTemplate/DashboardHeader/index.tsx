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
    <div className="bg-white shadow-lg border-b border-gray-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 merchant-gradient-light rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 merchant-light-bg rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between py-8">
          {/* Store Info */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                {merchant?.logo ? (
                  <Image
                    src={merchant.logo}
                    alt={merchant.store_name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                )}
              </div>
              {merchant?.is_active && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Store Details */}
            <div>
              <h1 className="text-2xl font-bold merchant-primary-text">
                {merchant?.store_name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-4 py-2 border merchant-primary-border rounded-lg text-sm font-medium merchant-primary-text bg-white hover:merchant-light-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <svg
                className="w-4 h-4 mr-2"
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
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white merchant-primary merchant-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <svg
                className="w-4 h-4 mr-2"
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
