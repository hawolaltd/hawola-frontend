import React from "react";

interface MerchantStatsProps {
  merchantLevel: string;
  shippingDays: number;
  isActive: boolean;
  dateAdded: string;
  isStreaming: boolean;
}

const MerchantStats = ({
  merchantLevel,
  shippingDays,
  isActive,
  dateAdded,
  isStreaming,
}: MerchantStatsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold merchant-primary-text mb-4">
        Store Statistics
      </h3>

      <div className="space-y-4">
        {/* Shipping Days */}
        <div className="flex items-center justify-between p-3 merchant-light-bg rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 merchant-primary rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Shipping</p>
              <p className="text-lg font-semibold text-gray-900">
                {shippingDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Store Status */}
        <div className="flex items-center justify-between p-3 merchant-medium-bg rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 merchant-primary rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
        </div>

        {/* Streaming Status */}
        {isStreaming && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Live</p>
                <p className="text-lg font-semibold text-gray-900">
                  Streaming Now
                </p>
              </div>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center justify-between p-3 merchant-light-bg rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 merchant-primary rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(dateAdded)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantStats;
