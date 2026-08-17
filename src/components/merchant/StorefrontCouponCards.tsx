"use client";

import { useState } from "react";
import { toast } from "sonner";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { formatCouponOfferLabel } from "@/lib/storeCouponDiscount";
import { MerchantLogoOrInitial } from "@/components/merchant/MerchantLogoOrInitial";

export type StorefrontCoupon = {
  id: number;
  code: string;
  name?: string;
  discount_type: string;
  value: string | number;
  scope: string;
  product_ids?: number[];
  ends_at?: string | null;
};

type Props = {
  coupons?: StorefrontCoupon[] | null;
  storeName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  className?: string;
};

/**
 * Public store homepage coupon tickets — Use coupon stashes code for cart/checkout
 * and drives discounted prices on eligible product cards.
 */
export default function StorefrontCouponCards({
  coupons,
  storeName,
  logoUrl,
  primaryColor,
  className = "",
}: Props) {
  const [activeCode, setActiveCode] = useState("");
  const list = Array.isArray(coupons) ? coupons.filter((c) => c?.code) : [];
  if (!list.length) return null;

  const brand = storeName?.trim() || "Store";
  const accent = primaryColor?.trim() || "#0E224D";

  const useCoupon = (c: StorefrontCoupon) => {
    const code = String(c.code || "").trim().toUpperCase();
    if (!code) return;
    savePendingCouponCode(code, {
      code,
      discount_type: c.discount_type,
      value: Number(c.value) || 0,
      scope: c.scope || "all",
      product_ids: c.product_ids || [],
    });
    setActiveCode(code);
    toast.success(
      `Coupon ${code} ready — eligible products show the discount. Add to cart to checkout with it.`
    );
  };

  return (
    <section className={`space-y-3 ${className}`} aria-label="Store coupons">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Store offers
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          Coupons you can use
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => {
          const code = String(c.code).toUpperCase();
          const offer = formatCouponOfferLabel(c);
          const scopeLabel =
            c.scope === "products"
              ? `${(c.product_ids || []).length || "Selected"} products`
              : "All store products";
          const isActive = activeCode === code;

          return (
            <div
              key={c.id || code}
              className="relative overflow-hidden rounded-2xl border border-dashed border-orange-400/50 bg-gradient-to-br from-[#0E224D] to-[#1a3a6e] text-white shadow-md"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white"
              />
              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center gap-3">
                  <MerchantLogoOrInitial
                    logoUrl={logoUrl || undefined}
                    storeName={brand}
                    primaryColor={accent}
                    alt=""
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#FD9636]/70 bg-white"
                    imgClassName="h-full w-full object-cover"
                    fallbackTextClassName="text-sm font-bold"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {brand}
                    </p>
                    <p className="truncate text-xs text-white/75">
                      {c.name?.trim() || "Store coupon"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {offer}
                </p>
                <p className="mt-1 text-sm text-white/70">{scopeLabel}</p>
                <div className="mt-3 inline-flex items-center rounded-xl bg-white/10 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-[#FD9636]">
                  {code}
                </div>
                <button
                  type="button"
                  onClick={() => useCoupon(c)}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#FD9636] px-4 py-2.5 text-sm font-bold text-[#0E224D] transition hover:bg-[#ffaa55] active:scale-[0.99]"
                >
                  {isActive ? "Coupon applied ✓" : "Use coupon"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
