"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useAppSelector } from "@/hook/useReduxTypes";
import CouponTicketCard from "@/components/coupons/CouponTicketCard";
import SignupBonusPromoCard from "@/components/auth/SignupBonusPromoCard";
import { isSignupBonusPromoVisible } from "@/lib/signupBonusPromo";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { formatCurrency } from "@/util";
import {
  claimCouponCenterOffer,
  fetchCouponCenter,
  type CouponCenterClaimedCoupon,
  type CouponCenterPayload,
  type CouponCenterPlatformCoupon,
  type CouponCenterPublicCoupon,
  type CouponCenterStoreCoupon,
} from "@/services/couponCenterService";

const GUEST_CLAIMS_KEY = "hawola-coupon-center-guest-claims";

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

function platformStatusLabel(coupon: CouponCenterPlatformCoupon): string {
  if (coupon.is_usable) return "Ready to use";
  if (coupon.status === "used") return "Already used";
  if (coupon.status === "expired") return "Expired";
  if (coupon.status === "void") return "No longer valid";
  return "Unavailable";
}

function storeScopeLabel(coupon: CouponCenterStoreCoupon): string {
  if (coupon.scope === "products") {
    const n = coupon.product_ids?.length || 0;
    return n ? `${n} selected products` : "Selected products";
  }
  return "All store products";
}

function CouponCenterSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading coupons">
      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-200/80" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CouponCenter() {
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
        const guestClaims = readGuestClaims();
        payload.claimed_coupons = [...guestClaims, ...payload.claimed_coupons];
      }
      setData(payload);
    } catch {
      toast.error("Could not load coupon center.");
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
    async (
      code: string,
      source: "store" | "public",
      meta: {
        discount_type: string;
        value: string | number;
        scope?: string;
        product_ids?: number[];
        name?: string;
        label?: string;
        merchant?: CouponCenterStoreCoupon["merchant"];
        ends_at?: string | null;
      }
    ) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return;
      setBusyCode(normalized);
      try {
        await claimCouponCenterOffer(normalized, source);
        if (!isAuthenticated) {
          writeGuestClaim({
            kind: source,
            code: normalized,
            claimed_at: new Date().toISOString(),
            discount_type: meta.discount_type,
            value: String(meta.value),
            scope: meta.scope,
            product_ids: meta.product_ids,
            ends_at: meta.ends_at,
            name: meta.name,
            label: meta.label,
            merchant: meta.merchant,
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

  if (loading) return <CouponCenterSkeleton />;
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        Unable to load coupons right now. Please refresh and try again.
      </div>
    );
  }

  const signupPromo =
    isSignupBonusPromoVisible(data.signup_promo) ? data.signup_promo : null;

  const unclaimedStore = data.available_store_coupons.filter(
    (c) => !claimedCodes.has(c.code.toUpperCase())
  );
  const unclaimedPublic = data.public_coupons.filter(
    (c) => !claimedCodes.has(c.code.toUpperCase())
  );

  return (
    <div className="space-y-10">
      {!isAuthenticated ? (
        <section className="rounded-2xl border border-[#FD9636]/30 bg-gradient-to-br from-[#fff7ef] to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FD9636]">
                Join Hawola
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#0E224D]">
                Create a free account to keep your coupons
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Browse offers now, claim store coupons, and sign up so your wallet
                follows you on every device.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/auth/register?redirect=${encodeURIComponent("/coupons")}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#0E224D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#152d5c]"
              >
                Sign up free
              </Link>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent("/coupons")}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0E224D] transition hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {signupPromo && !isAuthenticated ? (
        <section>
          <SignupBonusPromoCard promo={signupPromo} variant="banner" />
        </section>
      ) : null}

      {data.my_coupons.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Your Hawola coupons
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Personal offers assigned to you
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.my_coupons.map((coupon) => (
              <CouponTicketCard
                key={`mine-${coupon.id}`}
                code={coupon.code}
                discount_type={coupon.discount_type}
                value={coupon.value}
                title="Hawola"
                subtitle={coupon.label}
                scopeLabel={
                  Number(coupon.min_order_amount) > 0
                    ? `Min order ${formatCurrency(coupon.min_order_amount)}`
                    : "Platform checkout"
                }
                endsAt={coupon.ends_at}
                statusLabel={platformStatusLabel(coupon)}
                usable={coupon.is_usable}
                claimed={coupon.is_usable}
                busy={busyCode === coupon.code.toUpperCase()}
                onAction={
                  coupon.is_usable
                    ? () =>
                        stashAndGo(coupon.code, {
                          discount_type: coupon.discount_type,
                          value: coupon.value,
                        })
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : isAuthenticated ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-600">
          You don&apos;t have any personal Hawola coupons yet. Check store offers
          below or watch for live deals while you shop.
        </section>
      ) : null}

      {data.claimed_coupons.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Saved coupons
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Claimed and ready for checkout
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.claimed_coupons.map((coupon) => (
              <CouponTicketCard
                key={`claimed-${coupon.code}`}
                code={coupon.code}
                discount_type={coupon.discount_type}
                value={coupon.value}
                title={coupon.label || "Saved coupon"}
                subtitle={coupon.name}
                scopeLabel={
                  coupon.scope === "products"
                    ? `${coupon.product_ids?.length || 0} products`
                    : coupon.kind === "public"
                      ? "Hawola checkout"
                      : "Store products"
                }
                endsAt={coupon.ends_at}
                merchant={coupon.merchant}
                claimed
                busy={busyCode === coupon.code.toUpperCase()}
                onAction={() =>
                  stashAndGo(coupon.code, {
                    discount_type: coupon.discount_type,
                    value: coupon.value,
                    scope: coupon.scope,
                    product_ids: coupon.product_ids,
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {unclaimedStore.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Store offers
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Coupons from Hawola merchants
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unclaimedStore.map((coupon) => (
              <CouponTicketCard
                key={`store-${coupon.id}`}
                code={coupon.code}
                discount_type={coupon.discount_type}
                value={coupon.value}
                title={coupon.merchant?.store_name}
                subtitle={coupon.name || "Store coupon"}
                scopeLabel={storeScopeLabel(coupon)}
                endsAt={coupon.ends_at}
                merchant={coupon.merchant}
                busy={busyCode === coupon.code.toUpperCase()}
                onAction={() =>
                  handleClaim(coupon.code, "store", {
                    discount_type: coupon.discount_type,
                    value: coupon.value,
                    scope: coupon.scope,
                    product_ids: coupon.product_ids,
                    name: coupon.name,
                    label: coupon.merchant?.store_name,
                    merchant: coupon.merchant,
                    ends_at: coupon.ends_at,
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {unclaimedPublic.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Hawola codes
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Shared platform coupons
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unclaimedPublic.map((coupon) => (
              <CouponTicketCard
                key={`public-${coupon.id}`}
                code={coupon.code}
                discount_type={coupon.discount_type}
                value={coupon.value}
                title="Hawola"
                subtitle={coupon.label || "Storewide offer"}
                scopeLabel={
                  Number(coupon.min_order_amount) > 0
                    ? `Min order ${formatCurrency(coupon.min_order_amount || 0)}`
                    : "All eligible checkout items"
                }
                endsAt={coupon.ends_at}
                usable={coupon.is_usable !== false}
                busy={busyCode === coupon.code.toUpperCase()}
                onAction={() =>
                  handleClaim(coupon.code, "public", {
                    discount_type: coupon.discount_type,
                    value: coupon.value,
                    label: coupon.label,
                    ends_at: coupon.ends_at,
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {!data.my_coupons.length &&
      !data.claimed_coupons.length &&
      !unclaimedStore.length &&
      !unclaimedPublic.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-[#0E224D]">No coupons available yet</p>
          <p className="mt-2 text-sm text-slate-600">
            Check back soon — merchants add new offers regularly.
          </p>
          {!isAuthenticated ? (
            <Link
              href={`/auth/register?redirect=${encodeURIComponent("/coupons")}`}
              className="mt-5 inline-flex rounded-xl bg-[#FD9636] px-5 py-2.5 text-sm font-bold text-[#0E224D]"
            >
              Sign up to get notified
            </Link>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
