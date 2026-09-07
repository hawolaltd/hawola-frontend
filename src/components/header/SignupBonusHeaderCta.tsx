"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { GiftIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "@/util";
import { createSignupPromoPalette } from "@/lib/signupPromoPalette";
import type { SignupBonusPromo } from "@/services/signupBonusService";
import {
  shouldHideSignupBonusAmount,
  signupBonusHeaderChipLabel,
  signupBonusHiddenHeadline,
} from "@/lib/signupBonusPromo";

type Props = {
  promo: SignupBonusPromo;
  variant?: "header" | "drawer";
  onNavigate?: () => void;
};

export default function SignupBonusHeaderCta({
  promo,
  variant = "header",
  onNavigate,
}: Props) {
  const router = useRouter();
  const palette = useMemo(() => createSignupPromoPalette(), []);

  const amount = Number(promo.fixed_amount) || 0;
  if (!amount) return null;

  const amountLabel = formatCurrency(amount.toFixed(2));
  const headerAmountLabel = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  const drawerBadge = promo.promo_badge_text || "Welcome bonus";
  const headerBadge = "Gift";
  const hideAmount = shouldHideSignupBonusAmount(promo);
  const registerHref = `/auth/register?redirect=${encodeURIComponent(router.asPath || "/")}`;

  if (variant === "drawer") {
    return (
      <Link
        href={registerHref}
        prefetch={false}
        onClick={onNavigate}
        className="mt-3 flex items-center gap-3 rounded-xl border-2 p-3 transition-transform hover:scale-[1.01]"
        style={{
          borderColor: `${palette.primary}55`,
          background: palette.surface,
        }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: palette.primary }}
        >
          <GiftIcon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-[10px] font-bold uppercase tracking-wider"
            style={{ color: palette.primary }}
          >
            {drawerBadge}
          </span>
          <span className="block text-sm font-bold text-primary">
            {hideAmount
              ? `${signupBonusHiddenHeadline(promo)}. Sign up free`
              : `Get ${amountLabel} off. Sign up free`}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            New members receive a coupon after registration
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={registerHref}
      prefetch={false}
      className="relative inline-flex h-9 max-w-[180px] shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 text-[11px] font-semibold leading-none shadow-sm transition hover:brightness-[0.98] sm:max-w-[210px] sm:px-3 sm:text-xs"
      style={{
        borderColor: `${palette.primary}88`,
        color: palette.text,
        background: `linear-gradient(135deg, ${palette.primary}16, white 70%)`,
      }}
      aria-label={
        hideAmount
          ? "Sign up for a signup bonus"
          : `Sign up and get ${headerAmountLabel} off`
      }
      title={
        hideAmount
          ? signupBonusHiddenHeadline(promo)
          : `${headerBadge}: ${headerAmountLabel} off when you join`
      }
    >
      <GiftIcon
        className="h-4 w-4 shrink-0"
        style={{ color: palette.primary }}
        aria-hidden
      />
      <span className="min-w-0 truncate">
        {signupBonusHeaderChipLabel(promo, headerAmountLabel)}
      </span>
    </Link>
  );
}
