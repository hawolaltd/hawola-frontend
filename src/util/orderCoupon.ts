/**
 * Helpers for showing live/store coupon on order summaries.
 * Coupon fields may be on the order itself or nested under item.order.
 */

export type OrderCouponSource = {
  coupon_code?: string | null;
  coupon_discount?: string | number | null;
  totalPriceDue?: string | number | null;
  order_total_due?: string | number | null;
  order?: {
    coupon_code?: string | null;
    coupon_discount?: string | number | null;
    totalPriceDue?: string | number | null;
  } | null;
};

export function getOrderCouponCode(src?: OrderCouponSource | null): string {
  if (!src) return "";
  return String(src.coupon_code || src.order?.coupon_code || "").trim();
}

export function getOrderCouponDiscount(src?: OrderCouponSource | null): number {
  if (!src) return 0;
  const raw = src.coupon_discount ?? src.order?.coupon_discount ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function getOrderAmountDue(src?: OrderCouponSource | null): number | null {
  if (!src) return null;
  const raw = src.order_total_due ?? src.totalPriceDue ?? src.order?.totalPriceDue;
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
