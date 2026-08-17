import { useCallback, useEffect, useState } from "react";
import {
  readPendingCouponCode,
  readPendingCouponMeta,
} from "@/lib/pendingCoupon";
import type { StorefrontCouponMeta } from "@/lib/storeCouponDiscount";
import {
  couponAppliesToProduct,
  couponDiscountedUnitPrice,
} from "@/lib/storeCouponDiscount";

export function usePendingStoreCoupon() {
  const [code, setCode] = useState("");
  const [meta, setMeta] = useState<StorefrontCouponMeta | null>(null);

  const refresh = useCallback(() => {
    setCode(readPendingCouponCode());
    setMeta(readPendingCouponMeta());
  }, []);

  useEffect(() => {
    refresh();
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        code?: string;
        meta?: StorefrontCouponMeta | null;
      };
      setCode((detail?.code || "").toUpperCase());
      setMeta(detail?.meta ?? readPendingCouponMeta());
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "hawola_pending_coupon_code" ||
        e.key === "hawola_pending_coupon_meta"
      ) {
        refresh();
      }
    };
    window.addEventListener("hawola:pending-coupon", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("hawola:pending-coupon", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const priceFor = useCallback(
    (listPrice: number | string, productId: number | null | undefined) => {
      const base = Number(listPrice);
      if (!Number.isFinite(base)) {
        return { display: listPrice, couponApplied: false as const, pct: null as number | null };
      }
      const discounted = couponDiscountedUnitPrice(base, meta, productId);
      if (discounted == null || !meta?.code || meta.value <= 0) {
        return { display: base, couponApplied: false as const, pct: null as number | null };
      }
      if (!couponAppliesToProduct(meta, productId)) {
        return { display: base, couponApplied: false as const, pct: null as number | null };
      }
      const pct =
        base > 0
          ? Math.round(((base - discounted) / base) * 100)
          : null;
      return { display: discounted, couponApplied: true as const, pct, list: base };
    },
    [meta]
  );

  return { code, meta, priceFor };
}
