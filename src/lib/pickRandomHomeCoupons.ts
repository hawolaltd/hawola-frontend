import type {
  CouponCenterPublicCoupon,
  CouponCenterStoreCoupon,
} from "@/services/couponCenterService";

export type HomeDiscoverableCoupon =
  | (CouponCenterStoreCoupon & { kind: "store" })
  | (CouponCenterPublicCoupon & { kind: "public" });

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Unclaimed store + public coupons, shuffled and capped for home strips. */
export function pickRandomHomeCoupons(
  storeCoupons: CouponCenterStoreCoupon[] | undefined,
  publicCoupons: CouponCenterPublicCoupon[] | undefined,
  claimedCodes: Set<string>,
  limit = 5
): HomeDiscoverableCoupon[] {
  const pool: HomeDiscoverableCoupon[] = [];

  for (const coupon of storeCoupons || []) {
    if (claimedCodes.has(coupon.code.toUpperCase())) continue;
    pool.push({ ...coupon, kind: "store" });
  }
  for (const coupon of publicCoupons || []) {
    if (claimedCodes.has(coupon.code.toUpperCase())) continue;
    pool.push({ ...coupon, kind: "public" });
  }

  return shuffle(pool).slice(0, Math.max(1, limit));
}
