import axiosInstance from "@/libs/api/axiosInstance";
import { getOrCreatePresenceSessionKey } from "@/lib/presenceContext";

export type CouponValidateResult = {
  code: string;
  discount_type: string;
  value: string;
  discount_goods: string;
  discount_shipping: string;
  amount_saved: string;
  total_due: string;
};

export async function validateCoupon(params: {
  code: string;
  goods_total: number;
  shipping_total: number;
}): Promise<CouponValidateResult> {
  const { data } = await axiosInstance.post("coupons/validate/", {
    code: params.code,
    goods_total: params.goods_total,
    shipping_total: params.shipping_total,
    session_key: getOrCreatePresenceSessionKey(),
  });
  return data;
}
