"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import CouponTicketCard from "@/components/coupons/CouponTicketCard";
import { HomeSectionHeader } from "@/components/home/body/HomeSectionHeader";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import {
  pickRandomHomeCoupons,
  type HomeDiscoverableCoupon,
} from "@/lib/pickRandomHomeCoupons";
import { formatCurrency } from "@/util";
import { useAppSelector } from "@/hook/useReduxTypes";
import {
  claimCouponCenterOffer,
  fetchCouponCenter,
  type CouponCenterClaimedCoupon,
  type CouponCenterPayload,
  type CouponCenterStoreCoupon,
} from "@/services/couponCenterService";

const GUEST_CLAIMS_KEY = "hawola-coupon-center-guest-claims";
const HOME_COUPON_LIMIT = 5;

function readGuestClaims(): CouponCenterClaimedCoupon[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CLAIMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestClaim(row: CouponCenterClaimedCoupon) {
  if (typeof window === "undefined") return;
  const existing = readGuestClaims().filter(
    (c) => c.code.toUpperCase() !== row.code.toUpperCase()
  );
  existing.unshift(row);
  localStorage.setItem(GUEST_CLAIMS_KEY, JSON.stringify(existing.slice(0, 50)));
}

function storeScopeLabel(coupon: CouponCenterStoreCoupon): string {
  if (coupon.scope === "products") {
    const n = coupon.product_ids?.length || 0;
    return n ? `${n} selected products` : "Selected products";
  }
  return "All store products";
}

function couponCardProps(coupon: HomeDiscoverableCoupon) {
  if (coupon.kind === "store") {
    return {
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      title: coupon.merchant?.store_name || coupon.name || "Store offer",
      subtitle: coupon.name || "Store coupon",
      scopeLabel: storeScopeLabel(coupon),
      endsAt: coupon.ends_at,
      merchant: coupon.merchant,
      href: coupon.merchant?.slug
        ? `/store/${coupon.merchant.slug}`
        : undefined,
    };
  }

  const minOrder = Number(coupon.min_order_amount) || 0;
  return {
    code: coupon.code,
    discount_type: coupon.discount_type,
    value: coupon.value,
    title: "Hawola",
    subtitle: coupon.label || "Marketplace coupon",
    scopeLabel:
      minOrder > 0
        ? `Min order ${formatCurrency(coupon.min_order_amount)}`
        : "All eligible checkout",
    endsAt: coupon.ends_at,
    merchant: null,
  };
}

export default function HomeRandomCouponsSection({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<CouponCenterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchCouponCenter();
      if (!payload.is_authenticated) {
        payload.claimed_coupons = [
          ...readGuestClaims(),
          ...payload.claimed_coupons,
        ];
      }
      setData(payload);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, isAuthenticated]);

  const claimedCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of data?.claimed_coupons || []) {
      codes.add(row.code.toUpperCase());
    }
    return codes;
  }, [data?.claimed_coupons]);

  const coupons = useMemo(() => {
    if (!data) return [];
    return pickRandomHomeCoupons(
      data.available_store_coupons,
      data.public_coupons,
      claimedCodes,
      HOME_COUPON_LIMIT
    );
  }, [data, claimedCodes]);

  const stashAndGo = useCallback(
    (
      code: string,
      meta: {
        discount_type: string;
        value: string | number;
        scope?: string;
        product_ids?: number[];
      }
    ) => {
      const normalized = code.trim().toUpperCase();
      savePendingCouponCode(normalized, {
        code: normalized,
        discount_type: meta.discount_type,
        value: Number(meta.value) || 0,
        scope: meta.scope || "all",
        product_ids: meta.product_ids || [],
      });
      void router.push(`/carts?coupon=${encodeURIComponent(normalized)}`);
    },
    [router]
  );

  const handleClaim = useCallback(
    async (coupon: HomeDiscoverableCoupon) => {
      const normalized = coupon.code.trim().toUpperCase();
      if (!normalized) return;
      setBusyCode(normalized);
      try {
        await claimCouponCenterOffer(normalized, coupon.kind);
        if (!isAuthenticated) {
          writeGuestClaim({
            kind: coupon.kind,
            code: normalized,
            claimed_at: new Date().toISOString(),
            discount_type: coupon.discount_type,
            value: String(coupon.value),
            scope: coupon.kind === "store" ? coupon.scope : undefined,
            product_ids:
              coupon.kind === "store" ? coupon.product_ids : undefined,
            ends_at: coupon.ends_at,
            name: coupon.kind === "store" ? coupon.name : undefined,
            label: coupon.kind === "public" ? coupon.label : undefined,
            merchant: coupon.kind === "store" ? coupon.merchant : null,
          });
        }
        toast.success(`Coupon ${normalized} saved to your wallet`);
        await load();
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Could not claim this coupon.";
        toast.error(detail);
      } finally {
        setBusyCode("");
      }
    },
    [isAuthenticated, load]
  );

  if (loading) {
    return (
      <section className={`py-8 ${className}`} aria-busy="true" aria-hidden>
        <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-slate-200/80"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!coupons.length) return null;

  return (
    <section className={`py-8 sm:py-10 ${className}`}>
      <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
        <HomeSectionHeader
          eyebrow="Save more"
          title="Coupons for you"
          action={
            <Link
              href="/coupons"
              className="shrink-0 text-sm font-semibold text-[#425A8B] no-underline transition hover:text-[#0E224D]"
            >
              View all
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {coupons.map((coupon) => {
            const props = couponCardProps(coupon);
            const normalized = coupon.code.toUpperCase();
            const claimed = claimedCodes.has(normalized);
            return (
              <div
                key={`${coupon.kind}-${coupon.id}-${coupon.code}`}
                className="min-w-0"
              >
                <CouponTicketCard
                  {...props}
                  claimed={claimed}
                  busy={busyCode === normalized}
                  onAction={
                    claimed
                      ? () =>
                          stashAndGo(coupon.code, {
                            discount_type: coupon.discount_type,
                            value: coupon.value,
                            scope:
                              coupon.kind === "store"
                                ? coupon.scope
                                : undefined,
                            product_ids:
                              coupon.kind === "store"
                                ? coupon.product_ids
                                : undefined,
                          })
                      : () => void handleClaim(coupon)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
