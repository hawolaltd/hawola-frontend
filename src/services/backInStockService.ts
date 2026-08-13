import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";
import Cookies from "js-cookie";
import {
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";

/** Match productService: API already ends with `/api/`. */
const base = `${API}products/back-in-stock`;

export type BackInStockSubscribeResponse = {
  needs_verification?: boolean;
  already_subscribed?: boolean;
  account_created?: boolean;
  email?: string;
  alert_id?: number;
  detail?: string;
  registered_at?: string | null;
  registered_date_label?: string | null;
};

export type BackInStockVerifyResponse = {
  detail?: string;
  alerts_activated?: number;
  access?: string;
  refresh?: string;
  user?: Record<string, unknown>;
};

export async function subscribeBackInStock(payload: {
  product_id: number;
  email: string;
  phone_number: string;
  source?: "web" | "app";
}): Promise<BackInStockSubscribeResponse> {
  const { data } = await axiosInstance.post(`${base}/subscribe/`, {
    ...payload,
    source: payload.source || "web",
  });
  return data;
}

export async function verifyBackInStock(payload: {
  product_id: number;
  email: string;
  code: string;
}): Promise<BackInStockVerifyResponse> {
  const { data } = await axiosInstance.post(`${base}/verify/`, payload);
  if (data?.access) {
    Cookies.set(authTokenStorageKeyName as string, data.access);
    if (data.refresh) {
      Cookies.set(authRefreshTokenStorageKeyName as string, data.refresh);
    }
  }
  return data;
}

export async function resendBackInStockCode(payload: {
  product_id: number;
  email: string;
}): Promise<{ detail?: string }> {
  const { data } = await axiosInstance.post(`${base}/resend/`, payload);
  return data;
}

export async function getBackInStockStatus(productId: number): Promise<{
  subscribed: boolean;
  pending_verify: boolean;
  status: string | null;
  registered_at?: string | null;
  registered_date_label?: string | null;
  detail?: string | null;
}> {
  const { data } = await axiosInstance.get(`${base}/status/`, {
    params: { product_id: productId },
  });
  return data;
}
