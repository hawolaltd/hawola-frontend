import axiosInstance from "@/libs/api/axiosInstance";
import { getOrCreatePresenceSessionKey } from "@/lib/presenceContext";
import type { SignupBonusPromo } from "@/services/signupBonusService";

export type CouponCenterMerchant = {
  id: number | null;
  store_name: string;
  slug: string;
  logo_url: string;
  primary_color?: string;
};

export type CouponCenterPlatformCoupon = {
  kind: "platform";
  id: number;
  code: string;
  discount_type: string;
  value: string;
  min_order_amount?: string;
  max_discount?: string | null;
  status: string;
  is_usable: boolean;
  issuance_source?: string;
  label: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_public?: boolean;
};

export type CouponCenterStoreCoupon = {
  kind: "store";
  id: number;
  code: string;
  name?: string;
  discount_type: string;
  value: string;
  scope: string;
  product_ids?: number[];
  ends_at?: string | null;
  claimed?: boolean;
  merchant?: CouponCenterMerchant;
};

export type CouponCenterPublicCoupon = {
  kind: "public";
  id: number;
  code: string;
  discount_type: string;
  value: string;
  min_order_amount?: string;
  max_discount?: string | null;
  ends_at?: string | null;
  max_redemptions?: number | null;
  is_usable?: boolean;
  claimed?: boolean;
  label?: string;
};

export type CouponCenterClaimedCoupon = {
  kind: "store" | "public";
  code: string;
  claimed_at?: string | null;
  discount_type: string;
  value: string;
  scope?: string;
  product_ids?: number[];
  ends_at?: string | null;
  name?: string;
  label?: string;
  merchant?: CouponCenterMerchant | null;
  store_coupon_id?: number;
  public_coupon_id?: number;
};

export type CouponCenterPayload = {
  is_authenticated: boolean;
  my_coupons: CouponCenterPlatformCoupon[];
  claimed_coupons: CouponCenterClaimedCoupon[];
  available_store_coupons: CouponCenterStoreCoupon[];
  public_coupons: CouponCenterPublicCoupon[];
  signup_promo?: SignupBonusPromo | null;
};

export async function fetchCouponCenter(): Promise<CouponCenterPayload> {
  const sessionKey = getOrCreatePresenceSessionKey();
  const { data } = await axiosInstance.get<CouponCenterPayload>("coupons/center/", {
    params: sessionKey ? { session_key: sessionKey } : undefined,
  });
  return data;
}

export async function claimCouponCenterOffer(
  code: string,
  source?: "store" | "public"
): Promise<{ ok: boolean; coupon?: CouponCenterStoreCoupon | CouponCenterPublicCoupon; source?: string }> {
  const { data } = await axiosInstance.post("coupons/center/claim/", {
    code,
    source: source || undefined,
  });
  return data;
}
