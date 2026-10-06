import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useAppDispatch } from "@/hook/useReduxTypes";
import { addToCarts, getCarts } from "@/redux/product/productSlice";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import type { NegotiationCheckout } from "@/lib/buyerChatApi";

export default function NegotiationCheckoutActions({
  checkout,
}: {
  checkout: NegotiationCheckout;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!checkout.product_id || !checkout.product_slug) return null;

  const rememberCoupon = () => {
    if (!checkout.coupon_code) return;
    savePendingCouponCode(
      checkout.coupon_code,
      {
        discount_type: checkout.discount_type || "fixed",
        value: Number(checkout.discount_value) || 0,
        scope: "products",
        product_ids: [checkout.product_id],
      },
      { role: "product" }
    );
  };

  const addToCart = async () => {
    setBusy(true);
    try {
      rememberCoupon();
      const res = await dispatch(
        addToCarts({
          items: [{ qty: 1, product: checkout.product_id }],
        })
      );
      if (res?.type?.includes("fulfilled")) {
        dispatch(getCarts());
        toast.success("Added to cart at the agreed price.");
        void router.push("/carts");
        return;
      }
      toast.error("Could not add this to your cart.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void addToCart()}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-inset ring-gray-300 disabled:opacity-50"
      >
        Add to cart
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          rememberCoupon();
          void router.push(`/product/${checkout.product_slug}?instant=1`);
        }}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        Buy now
      </button>
    </div>
  );
}
