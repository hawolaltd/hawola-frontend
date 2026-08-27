export type StorefrontCouponMeta = {
  code: string;
  discount_type: string;
  value: number;
  scope: string;
  product_ids: number[];
};

export type CartLineCouponPrice = {
  lineBefore: number;
  lineAfter: number;
  lineSaved: number;
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

function money(n: number): number {
  return Math.round(Math.max(0, n) * 100) / 100;
}

/**
 * Allocate a coupon's goods discount onto cart lines only when the coupon is
 * product-scoped (merchant/product coupon with productIds).
 * Cart/total coupons leave lines alone — discount shows only on the final total.
 */
export function allocateCartCouponByProduct(
  lines: Array<{ productId: number; lineTotal: number }>,
  opts: {
    amountSaved?: number | string | null;
    discountGoods?: number | string | null;
    productIds?: Array<number | string> | null;
  }
): Record<number, CartLineCouponPrice> {
  const goodsDiscount = money(
    Number(
      opts.discountGoods != null && opts.discountGoods !== ""
        ? opts.discountGoods
        : opts.amountSaved || 0
    ) || 0
  );
  if (goodsDiscount <= 0) return {};

  const scoped = Array.isArray(opts.productIds)
    ? opts.productIds.map(Number).filter((id) => Number.isFinite(id) && id > 0)
    : [];
  // General / cart-total coupons: do not split across products.
  if (!scoped.length) return {};

  const scopeSet = new Set(scoped);

  const eligible = lines.filter((line) => {
    const pid = Number(line.productId);
    const total = Number(line.lineTotal) || 0;
    if (!Number.isFinite(pid) || pid <= 0 || total <= 0) return false;
    return scopeSet.has(pid);
  });

  const eligibleTotal = eligible.reduce(
    (sum, line) => sum + (Number(line.lineTotal) || 0),
    0
  );
  if (eligibleTotal <= 0) return {};

  const out: Record<number, CartLineCouponPrice> = {};
  let remaining = goodsDiscount;

  eligible.forEach((line, index) => {
    const pid = Number(line.productId);
    const before = money(Number(line.lineTotal) || 0);
    const isLast = index === eligible.length - 1;
    let saved = isLast
      ? remaining
      : money((goodsDiscount * before) / eligibleTotal);
    saved = Math.min(before, Math.min(remaining, saved));
    remaining = money(remaining - saved);
    out[pid] = {
      lineBefore: before,
      lineAfter: money(before - saved),
      lineSaved: saved,
    };
  });

  return out;
}
