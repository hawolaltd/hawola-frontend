import dynamic from "next/dynamic";
import {AxiosRequestConfig} from "axios";
import {authRefreshTokenStorageKeyName, authTokenStorageKeyName} from "@/constant";
import Cookies from "js-cookie";
import {toast} from "react-toastify";

export const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
 * isEmpty:
 *
 * @param {Object} objectValue
 *
 * @returns {Boolean}
 */
export function isEmpty<ListOrObject>(objectValue: ListOrObject): boolean {
    if(!objectValue || typeof objectValue !== "object") {
        return true;
    }

    for(const prop in objectValue) {
        if(Object.prototype.hasOwnProperty.call(objectValue, prop)) {
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

    if (!isEmpty(amountText) && amountText[0] === "0" && amountText.length === 1) {
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
        toast.success(`Text copied to clipboard: ${text}`)
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
};


export const capitalize = (s: any) => (s && String(s[0]).toUpperCase() + String(s).slice(1)) || ""

