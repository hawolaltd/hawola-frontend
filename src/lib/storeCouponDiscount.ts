export type StorefrontCouponMeta = {
  code: string;
  discount_type: string;
  value: number;
  scope: string;
  product_ids: number[];
};

export function couponAppliesToProduct(
  meta: StorefrontCouponMeta | null | undefined,
  productId: number | null | undefined
): boolean {
  if (!meta?.code || productId == null) return false;
  if (meta.scope === "products") {
    return (meta.product_ids || []).includes(Number(productId));
  }
  return true;
}

/** Effective unit price after pending store coupon (null if not applicable). */
export function couponDiscountedUnitPrice(
  listPrice: number,
  meta: StorefrontCouponMeta | null | undefined,
  productId: number | null | undefined
): number | null {
  if (!couponAppliesToProduct(meta, productId)) return null;
  const price = Number(listPrice);
  if (!Number.isFinite(price) || price < 0) return null;
  const value = Number(meta!.value) || 0;
  if (meta!.discount_type === "percent") {
    return Math.max(0, Math.round(price * (1 - value / 100) * 100) / 100);
  }
  return Math.max(0, Math.round((price - value) * 100) / 100);
}

export function formatCouponOfferLabel(meta: {
  discount_type: string;
  value: string | number;
}): string {
  const valueNum = Number(meta.value) || 0;
  if (meta.discount_type === "percent") return `${valueNum}% off`;
  return `₦${valueNum.toLocaleString()} off`;
}
