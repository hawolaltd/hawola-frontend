import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";
import Cookies from "js-cookie";
import {
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";
import type { OrderDetailsResponse } from "@/types/product";

const base = `${API}orders/instant`;

export type InstantOrderInitiateResponse = {
  needs_verification?: boolean;
  account_created?: boolean;
  email?: string;
  intent_id?: number;
  detail?: string;
  order?: OrderDetailsResponse;
};

export type InstantOrderVerifyResponse = {
  detail?: string;
  order?: OrderDetailsResponse;
  account_created?: boolean;
  access?: string;
  refresh?: string;
  user?: Record<string, unknown>;
};

function persistAuthTokens(data: { access?: string; refresh?: string }) {
  if (data?.access) {
    Cookies.set(authTokenStorageKeyName as string, data.access);
    if (data.refresh) {
      Cookies.set(authRefreshTokenStorageKeyName as string, data.refresh);
    }
  }
}

export async function initiateInstantOrder(payload: {
  product_id: number;
  email: string;
  full_name: string;
  phone_number: string;
  address?: string;
  state?: string;
  location?: string;
  coupon_code?: string;
  coupon_code_secondary?: string;
  qty: number;
  variant?: Array<{ variant: number; variant_value: number }>;
}): Promise<InstantOrderInitiateResponse> {
  const { data } = await axiosInstance.post(`${base}/initiate/`, payload);
  persistAuthTokens(data);
  return data;
}

export async function placeInstantOrder(payload: {
  product_id: number;
  full_name: string;
  phone_number: string;
  address?: string;
  state?: string;
  location?: string;
  coupon_code?: string;
  coupon_code_secondary?: string;
  qty: number;
  variant?: Array<{ variant: number; variant_value: number }>;
}): Promise<{ detail?: string; order?: OrderDetailsResponse }> {
  const { data } = await axiosInstance.post(`${base}/place/`, payload);
  return data;
}

export async function verifyInstantOrder(payload: {
  product_id: number;
  email: string;
  code: string;
}): Promise<InstantOrderVerifyResponse> {
  const { data } = await axiosInstance.post(`${base}/verify/`, payload);
  persistAuthTokens(data);
  return data;
}

export async function resendInstantOrderCode(payload: {
  product_id: number;
  email: string;
}): Promise<{ detail?: string }> {
  const { data } = await axiosInstance.post(`${base}/resend/`, payload);
  return data;
}
