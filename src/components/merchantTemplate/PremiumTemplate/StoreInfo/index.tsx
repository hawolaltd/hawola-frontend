import React from "react";

interface StoreInfoProps {
  address: string;
  phone: string;
  email: string;
  location: string;
  state: string;
  market: string;
  refundPolicy: string;
}

const StoreInfo = ({
  address,
  phone,
  email,
  location,
  state,
  market,
  refundPolicy,
}: StoreInfoProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold merchant-primary-text mb-4">
        Store Information
      </h3>

      <div className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 merchant-light-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-4 h-4 merchant-primary-text"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Address</p>
            <p className="text-gray-600 text-sm">{address}</p>
            <p className="text-gray-500 text-xs">
              {location}, {state}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 merchant-light-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-4 h-4 merchant-primary-text"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Phone</p>
            <p className="text-gray-600 text-sm">{phone}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 merchant-light-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-4 h-4 merchant-primary-text"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Email</p>
            <p className="text-gray-600 text-sm">{email}</p>
          </div>
        </div>

        {/* Market */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 merchant-light-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-4 h-4 merchant-primary-text"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Market</p>
            <p className="text-gray-600 text-sm">{market}</p>
          </div>
        </div>

        {/* Refund Policy */}
        {refundPolicy && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 merchant-light-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-4 h-4 merchant-primary-text"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Refund Policy
                </p>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {refundPolicy}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInfo;
