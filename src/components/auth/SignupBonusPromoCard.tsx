"use client";

import { formatCurrency } from "@/util";
import type { SignupBonusPromo } from "@/services/signupBonusService";
import {
  signupBonusDiscountBullet,
  signupBonusJoinTitle,
} from "@/lib/signupBonusPromo";
import { createSignupPromoPalette, type SignupPromoPalette } from "@/lib/signupPromoPalette";
import SignupPromoProductMashup from "@/components/auth/SignupPromoProductMashup";
import { useMemo } from "react";

function formatEndsLabel(endsAt?: string | null): string | null {
  if (!endsAt) return null;
  try {
    const d = new Date(endsAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

type Props = {
  promo: SignupBonusPromo;
  variant?: "banner" | "hero";
};

function usePalette(): SignupPromoPalette {
  return useMemo(() => createSignupPromoPalette(), []);
}

export default function SignupBonusPromoCard({ promo, variant = "banner" }: Props) {
  const palette = usePalette();

  if (!promo.active || !promo.fixed_amount) return null;

  const amount = Number(promo.fixed_amount) || 0;
  const amountLabel = formatCurrency(amount.toFixed(2));
  const endsLabel = formatEndsLabel(promo.ends_at);
  const validDays = promo.coupon_valid_days ?? 30;
  const badge = promo.promo_badge_text || "New member gift";
  const body =
    promo.promo_body ||
    "Create your free account and verify your email. We'll send a personal coupon code you can use at checkout.";

  if (variant === "hero") {
    return (
      <div
        className="relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border p-5 shadow-sm sm:min-h-[600px] md:min-h-[640px] md:p-8"
        style={{
          borderColor: `${palette.primary}55`,
          background: palette.surface,
        }}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl"
          style={{ backgroundColor: `${palette.blobA}33` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full blur-2xl"
          style={{ backgroundColor: `${palette.blobB}28` }}
          aria-hidden
        />

        <div className="relative z-10 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: palette.primary }}
          >
            <span aria-hidden>✦</span>
            {badge}
          </span>
        </div>

        <div className="relative z-0 flex min-h-[360px] flex-1 items-center justify-center py-1 sm:min-h-[420px] md:min-h-[480px]">
          <SignupPromoProductMashup accent={palette.primary} />
        </div>

        <div className="relative z-10 mt-auto shrink-0 space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>
            {body}
          </p>
          <ul className="space-y-2 text-sm" style={{ color: palette.textMuted }}>
            <li className="flex items-start gap-2">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                style={{ backgroundColor: palette.accent }}
              >
                ✓
              </span>
              {signupBonusDiscountBullet(promo, amountLabel)}
            </li>
            {promo.min_order_label ? (
              <li className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: palette.accent }}
                >
                  ✓
                </span>
                {promo.min_order_label}
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                style={{ backgroundColor: palette.accent }}
              >
                ✓
              </span>
              Valid for {validDays} days after you sign up
            </li>
          </ul>
          {promo.promo_footer ? (
            <p
              className="rounded-xl border bg-white/80 px-3 py-2 text-xs font-medium"
              style={{ borderColor: `${palette.primary}40`, color: palette.text }}
            >
              {promo.promo_footer}
            </p>
          ) : null}
          {endsLabel ? (
            <p
              className="rounded-xl border bg-white/80 px-3 py-2 text-xs font-medium"
              style={{ borderColor: `${palette.primary}40`, color: palette.primary }}
            >
              Limited time. Offer ends {endsLabel}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-2xl border p-4 shadow-sm"
      role="status"
      style={{
        borderColor: `${palette.primary}44`,
        background: palette.surface,
      }}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l to-transparent"
        style={{ backgroundImage: `linear-gradient(to left, ${palette.primary}18, transparent)` }}
        aria-hidden
      />
      <div className="relative flex flex-wrap items-center gap-3 sm:gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-md"
          style={{ backgroundColor: palette.primary }}
        >
          🎁
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: palette.primary }}
          >
            {badge}
          </p>
          <p className="text-lg font-bold" style={{ color: palette.text }}>
            {signupBonusJoinTitle(promo, amountLabel)}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: palette.textMuted }}>
            {body}
            {promo.min_order_label ? ` ${promo.min_order_label}.` : ""}
            {endsLabel ? ` Ends ${endsLabel}.` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
