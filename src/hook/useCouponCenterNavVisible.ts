"use client";

import { useEffect, useState } from "react";
import {
  fetchCouponCenter,
  type CouponCenterPayload,
} from "@/services/couponCenterService";
import { isSignupBonusPromoVisible } from "@/lib/signupBonusPromo";

function couponCenterHasOffers(data: CouponCenterPayload): boolean {
  if (isSignupBonusPromoVisible(data.signup_promo)) return true;
  return (
    (data.my_coupons?.length ?? 0) > 0 ||
    (data.claimed_coupons?.length ?? 0) > 0 ||
    (data.available_store_coupons?.length ?? 0) > 0 ||
    (data.public_coupons?.length ?? 0) > 0
  );
}

/** Whether the header coupon-center nav icon should appear. */
export function useCouponCenterNavVisible(enabled = true) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    let cancelled = false;
    void fetchCouponCenter()
      .then((data) => {
        if (!cancelled) setVisible(couponCenterHasOffers(data));
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return visible;
}
