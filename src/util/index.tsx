import dynamic from "next/dynamic";
import { AxiosRequestConfig } from "axios";
import {
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useState } from "react";
import moment from "moment";
import storage from "redux-persist/lib/storage";

export const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * isCORSVIolation:
 *
 * @param {XMLHttpRequest} request
 * @param {AxiosRequestConfig | undefined} config
 *
 * @returns {Boolean}
 */
export const isCORSViolation = (
  request: XMLHttpRequest,
  config?: AxiosRequestConfig
) => {
  const frontendURIHost = window.location.host;
  const backendBaseURL = new URL(
    config?.baseURL || config?.url || "https://x.yz"
  );
  const backendURIHost = backendBaseURL.host;
  const isCrossDomainRequest =
    backendURIHost !== "x.yz" && frontendURIHost !== backendURIHost;

  let hasAccessControlOnOrigin = false;
  const requestHasValidStatus = Boolean(
    request.status >= 200 && request.status <= 508
  );
  const contentType = request.getResponseHeader("Content-Type");

  if (isCrossDomainRequest) {
    let allowedOrigin = "";
    if (config?.withCredentials) {
      allowedOrigin =
        request.getResponseHeader("Access-Control-Allow-Origin") || "";
    }

    if (allowedOrigin.trim() === "*") {
      if (request.withCredentials) {
        return true;
      }
    } else {
      hasAccessControlOnOrigin = Boolean(
        allowedOrigin.trim() === backendBaseURL.origin.trim()
      );
    }
  }

  return (
    isCrossDomainRequest &&
    requestHasValidStatus &&
    !hasAccessControlOnOrigin &&
    contentType !== null
  );
};

/**
 * handleLogout:
 *
 * @returns {void}
 */
export const handleLogout = () => {
  Cookies.remove(authRefreshTokenStorageKeyName as string);
  Cookies.remove(authTokenStorageKeyName as string);
  return;
};

/**
 * clearAllStorage:
 * Clears all storage including localStorage, cookies, and Redux persist
 * BUT preserves anonymous user cart items and session
 *
 * @returns {void}
 */
export const clearAllStorage = () => {
  if (typeof window === "undefined") return;
  
  // Preserve cart items and session for anonymous users
  let cartItems = null;
  let sessionId = null;
  
  cartItems = localStorage.getItem("cartItems");
  sessionId = localStorage.getItem("hawola_session_id");

  // Clear cookies
  Cookies.remove(authRefreshTokenStorageKeyName as string);
  Cookies.remove(authTokenStorageKeyName as string);

  // Clear localStorage
  localStorage.clear();

  // Restore preserved items
  if (cartItems) {
    localStorage.setItem("cartItems", cartItems);
  }
  if (sessionId) {
    localStorage.setItem("hawola_session_id", sessionId);
  }

  // Clear Redux persist storage
  storage.removeItem("persist:root");
};

/**
 * clearAllStorageWithPersistor:
 * Clears all storage including localStorage, cookies, and Redux persist using persistor
 * BUT preserves anonymous user cart items and session
 *
 * @param {any} persistor - The Redux persist persistor instance
 * @returns {Promise<void>}
 */
export const clearAllStorageWithPersistor = async (persistor: any) => {
  if (typeof window === "undefined") return;
  
  // Preserve cart items and session for anonymous users
  let cartItems = null;
  let sessionId = null;
  
  cartItems = localStorage.getItem("cartItems");
  sessionId = localStorage.getItem("hawola_session_id");

  // Clear cookies
  Cookies.remove(authRefreshTokenStorageKeyName as string);
  Cookies.remove(authTokenStorageKeyName as string);

  // Clear localStorage
  localStorage.clear();

  // Restore preserved items
  if (cartItems) {
    localStorage.setItem("cartItems", cartItems);
  }
  if (sessionId) {
    localStorage.setItem("hawola_session_id", sessionId);
  }

  // Purge Redux persist storage using persistor
  if (persistor) {
    await persistor.purge();
  } else {
    // Fallback to manual storage removal
    storage.removeItem("persist:root");
  }
};

/**
 * forceLogout:
 * Forces a complete logout by clearing all storage and redirecting
 * This should be used when tokens are invalid or missing
 *
 * @returns {void}
 */
export const forceLogout = () => {
  // Clear all storage
  clearAllStorage();

  // Force a page reload to reset Redux state
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

/**
 * checkTokenValidity:
 * Checks if valid tokens exist in cookies
 *
 * @returns {boolean}
 */
export const checkTokenValidity = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = Cookies.get(authTokenStorageKeyName as string);
  const refreshToken = Cookies.get(authRefreshTokenStorageKeyName as string);

  return !!(token && refreshToken);
};

/**
 * isEmpty:
 *
 * @param {Object} objectValue
 *
 * @returns {Boolean}
 */
export function isEmpty<ListOrObject>(objectValue: ListOrObject): boolean {
  if (!objectValue || typeof objectValue !== "object") {
    return true;
  }

  for (const prop in objectValue) {
    if (Object.prototype.hasOwnProperty.call(objectValue, prop)) {
      return false;
    }
  }

  return JSON.stringify(objectValue) === JSON.stringify({});
}

export const amountFormatter = (amountText?: string | null) => {
  let formatted = "";

  if (!amountText) {
    return formatted;
  }

  if (
    !isEmpty(amountText) &&
    amountText[0] === "0" &&
    amountText.length === 1
  ) {
    formatted = amountText;
  } else if (!isEmpty(amountText) && amountText[0] === "0") {
    formatted = amountText
      .toString()
      .replace(/^0/, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    formatted = amountText.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return formatted;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Text copied to clipboard: ${text}`);
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
};

export const capitalize = (s: any) =>
  (s && String(s[0]).toUpperCase() + String(s).slice(1)) || "";

/**
 * formatCurrency:
 * Formats a number or string as currency with proper formatting and symbol
 *
 * @param {number | string} amount - The amount to format
 * @param {string} [currencyCode='NGN'] - ISO 4217 currency code
 * @param {string} [locale='en-NG'] - The locale to use for formatting
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount: number | string,
  currencyCode: string = "NGN",
  locale: string = "en-NG"
): string => {
  // Convert string to number if needed
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if the amount is a valid number
  if (isNaN(numericAmount)) {
    return "";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(numericAmount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `${currencyCode} ${amountFormatter(numericAmount.toString())}`;
  }
};

export function normalizeErrors(errors: any): string {
  if (!errors) return "";

  // Case 1: Object with array values
  if (typeof errors === "object" && !Array.isArray(errors)) {
    const values = Object.values(errors);
    console.log("values", values);
    // Ensure all values are arrays of strings
    return values
      .flat()
      .map((error) => String(error))
      .join(", ");
  }

  // Case 2: Direct array of strings
  if (Array.isArray(errors)) {
    return errors.map((error) => String(error)).join(", ");
  }

  // Case 3: Single string error
  if (typeof errors === "string") {
    return errors;
  }

  // Case 4: Unexpected format - return generic error
  return "An unexpected error occurred";
}

export const TruncatedTextWithTooltip = ({
  text,
  maxLength = 25,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <div className="relative">
      <span
        className="truncate"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {text.substring(0, maxLength)}...
      </span>
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800 transform -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

/**
 * getLatestStatus:
 * get the status of an order
 *
 * @param {any} statusArray - array of status
 */

export const getLatestStatus = (statusArray: any) => {
  if (!statusArray?.length) return null;

  return statusArray.reduce((latest: any, current: any) => {
    const latestDate = moment(latest.created_at, "dddd, DD-MMMM-YYYY");
    const currentDate = moment(current.created_at, "dddd, DD-MMMM-YYYY");
    return currentDate.isAfter(latestDate) ? current : latest;
  });
};
