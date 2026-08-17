/**
 * Helpers for showing live/store coupon on order summaries.
 * Coupon fields may be on the order itself or nested under item.order.
 */

type NestedOrderCoupon = {
  coupon_code?: string | null;
  coupon_discount?: string | number | null;
  totalPriceDue?: string | number | null;
};

export type OrderCouponSource = {
  coupon_code?: string | null;
  coupon_discount?: string | number | null;
  totalPriceDue?: string | number | null;
  order_total_due?: string | number | null;
  /** Parent order FK id, or nested order payload with coupon fields. */
  order?: number | NestedOrderCoupon | null;
};

function nestedOrderCoupon(
  src?: OrderCouponSource | null
): NestedOrderCoupon | null {
  const o = src?.order;
  if (o && typeof o === "object") return o;
  return null;
}

export function getOrderCouponCode(src?: OrderCouponSource | null): string {
  if (!src) return "";
  const nested = nestedOrderCoupon(src);
  return String(src.coupon_code || nested?.coupon_code || "").trim();
}

export function getOrderCouponDiscount(src?: OrderCouponSource | null): number {
  if (!src) return 0;
  const nested = nestedOrderCoupon(src);
  const raw = src.coupon_discount ?? nested?.coupon_discount ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function getOrderAmountDue(src?: OrderCouponSource | null): number | null {
  if (!src) return null;
  const nested = nestedOrderCoupon(src);
  const raw = src.order_total_due ?? src.totalPriceDue ?? nested?.totalPriceDue;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatCouponDiscountLabel(
  src?: OrderCouponSource | null,
  formatMoney?: (n: number) => string
): string | null {
  const discount = getOrderCouponDiscount(src);
  if (!(discount > 0)) return null;
  const code = getOrderCouponCode(src);
  const amount = formatMoney
    ? formatMoney(discount)
    : `₦${discount.toLocaleString()}`;
  return code ? `Coupon ${code} · −${amount}` : `Coupon · −${amount}`;
}
