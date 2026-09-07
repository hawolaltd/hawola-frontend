import axiosInstance from "@/libs/api/axiosInstance";
import { getOrCreatePresenceSessionKey } from "@/lib/presenceContext";

export type CouponValidateCoupon = {
  code: string;
  discount_type: string;
  value: string;
  discount_goods: string;
  discount_shipping: string;
  amount_saved: string;
  source?: string;
  role?: "product" | "general" | string;
  merchant_id?: number;
  store_name?: string;
  eligible_goods?: string;
  product_ids?: number[];
};

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
  coupons?: CouponValidateCoupon[];
  roles?: { product?: string | null; general?: string | null };
  coupon_code_secondary?: string;
  secondary?: CouponValidateCoupon;
};

export type CouponCartItem = {
  product_id: number;
  qty: number;
  unit_price: number;
  merchant_id?: number;
  name?: string;
};

export async function validateCoupon(params: {
  code?: string;
  codes?: string[];
  coupon_code_secondary?: string;
  goods_total: number;
  shipping_total: number;
  product_id?: number;
  unit_price?: number;
  qty?: number;
  cart_items?: CouponCartItem[];
}): Promise<CouponValidateResult> {
  const codes = (params.codes || [])
    .map((c) => String(c || "").trim().toUpperCase())
    .filter(Boolean);
  const primary = (params.code || codes[0] || "").trim().toUpperCase();
  const secondary = (
    params.coupon_code_secondary ||
    (codes.length > 1 ? codes[1] : "") ||
    ""
  )
    .trim()
    .toUpperCase();

  const { data } = await axiosInstance.post("coupons/validate/", {
    code: primary,
    codes: codes.length ? codes : primary ? [primary] : [],
    coupon_code_secondary: secondary || undefined,
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
