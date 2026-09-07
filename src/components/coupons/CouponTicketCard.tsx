"use client";

import { useState } from "react";
import Link from "next/link";
import { MerchantLogoOrInitial } from "@/components/merchant/MerchantLogoOrInitial";
import { formatCouponOfferLabel } from "@/lib/storeCouponDiscount";
import type { CouponCenterMerchant } from "@/services/couponCenterService";

export type CouponTicketCardData = {
  code: string;
  discount_type: string;
  value: string | number;
  title?: string;
  subtitle?: string;
  scopeLabel?: string;
  endsAt?: string | null;
  merchant?: CouponCenterMerchant | null;
  statusLabel?: string;
  claimed?: boolean;
  usable?: boolean;
  ctaLabel?: string;
  busy?: boolean;
  onAction?: () => void;
  href?: string;
  /** When false, hide the copy chip affordance (default true). */
  copyable?: boolean;
};

function formatEndsAt(endsAt?: string | null): string | null {
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

export default function CouponTicketCard({
  code,
  discount_type,
  value,
  title,
  subtitle,
  scopeLabel,
  endsAt,
  merchant,
  statusLabel,
  claimed = false,
  usable = true,
  ctaLabel,
  busy = false,
  onAction,
  href,
  copyable = true,
}: CouponTicketCardData) {
  const [copied, setCopied] = useState(false);
  const offer = formatCouponOfferLabel({ discount_type, value });
  const brand = merchant?.store_name?.trim() || title?.trim() || "Hawola";
  const accent = merchant?.primary_color?.trim() || "#0E224D";
  const endsLabel = formatEndsAt(endsAt);
  const disabled = busy || (!usable && !claimed);
  const normalized = (code || "").trim().toUpperCase();

  const actionLabel =
    ctaLabel || (claimed ? "Apply to cart" : "Claim & apply");

  const copyCode = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!normalized || !copyable) return;
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const cardBody = (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-orange-400/45 bg-gradient-to-br from-[#0E224D] to-[#1a3a6e] text-white shadow-md transition hover:shadow-lg">
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
            logoUrl={merchant?.logo_url || undefined}
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
              {subtitle?.trim() || title?.trim() || "Coupon offer"}
            </p>
          </div>
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.65rem]">{offer}</p>
        {scopeLabel ? <p className="mt-1 text-sm text-white/70">{scopeLabel}</p> : null}
        {statusLabel ? (
          <p className="mt-1 text-xs font-medium text-[#FD9636]">{statusLabel}</p>
        ) : null}

        {copyable ? (
          <button
            type="button"
            onClick={(e) => void copyCode(e)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-[#FD9636] transition hover:bg-white/15"
            title="Copy coupon code"
          >
            <span>{normalized}</span>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-white/70">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        ) : (
          <div className="mt-3 inline-flex items-center rounded-xl bg-white/10 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-[#FD9636]">
            {normalized}
          </div>
        )}

        {endsLabel ? (
          <p className="mt-2 text-[11px] text-white/55">Valid until {endsLabel}</p>
        ) : null}

        {onAction ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction();
            }}
            disabled={disabled}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#FD9636] px-4 py-2.5 text-sm font-bold text-[#0E224D] transition hover:bg-[#ffaa55] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            {busy ? "Please wait…" : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardBody}
      </Link>
    );
  }

  return cardBody;
}
