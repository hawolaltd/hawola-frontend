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
  source?: string;
  merchant_id?: number;
  store_name?: string;
  eligible_goods?: string;
  product_ids?: number[];
};

export type CouponCartItem = {
  product_id: number;
  qty: number;
  unit_price: number;
  merchant_id?: number;
  name?: string;
};

export async function validateCoupon(params: {
  code: string;
  goods_total: number;
  shipping_total: number;
  product_id?: number;
  unit_price?: number;
  qty?: number;
  cart_items?: CouponCartItem[];
}): Promise<CouponValidateResult> {
  const { data } = await axiosInstance.post("coupons/validate/", {
    code: params.code,
    goods_total: params.goods_total,
    shipping_total: params.shipping_total,
    session_key: getOrCreatePresenceSessionKey(),
    product_id: params.product_id,
    unit_price: params.unit_price,
    qty: params.qty,
    cart_items: params.cart_items,
  });
  return data;
}
