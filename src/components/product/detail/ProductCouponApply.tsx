"use client";

import { useState } from "react";
import { toast } from "sonner";
import { validateCoupon } from "@/services/couponService";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { formatCurrency } from "@/util";

type Props = {
  productId: number;
  unitPrice: number;
  qty?: number;
};

/**
 * Product-page store coupon apply — validates against this product and
 * stashes the code for cart/checkout.
 */
export default function ProductCouponApply({
  productId,
  unitPrice,
  qty = 1,
}: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);
  const [applied, setApplied] = useState("");

  const apply = async () => {
    const raw = code.trim().toUpperCase();
    if (!raw) return;
    setBusy(true);
    try {
      const data = await validateCoupon({
        code: raw,
        goods_total: unitPrice * qty,
        shipping_total: 0,
        product_id: productId,
        unit_price: unitPrice,
        qty,
      });
      const amount = Number(data.amount_saved) || 0;
      setSaved(amount);
      setApplied((data.code || raw).toUpperCase());
      savePendingCouponCode(data.code || raw, {
        discount_type: data.discount_type,
        value: Number(data.value) || 0,
        scope: "products",
        product_ids: data.product_ids?.length ? data.product_ids : [productId],
      });
      toast.success(
        amount > 0
          ? `Coupon applied — save ${formatCurrency(amount)}`
          : "Coupon applied"
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setSaved(null);
      setApplied("");
      toast.error(err?.response?.data?.detail || "Invalid coupon");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#0E224D]/20 bg-[#0E224D]/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#0E224D]/55">
        Have a store coupon?
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#FD9636]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
        />
        <button
          type="button"
          disabled={busy || !code.trim()}
          onClick={() => void apply()}
          className="shrink-0 rounded-lg bg-[#0E224D] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "…" : "Apply"}
        </button>
      </div>
      {applied && saved != null ? (
        <p className="mt-2 text-xs font-medium text-emerald-700">
          {applied} ready — you’ll save {formatCurrency(saved)} on eligible
          items at checkout.
        </p>
      ) : null}
    </div>
  );
}
