"use client";

import type { NextRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { formatCurrency } from "@/util";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import {
  canShowFirstNegotiationOffer,
  fetchNegotiationOffer,
  hasAppliedNegotiationOffer,
  markNegotiationOfferApplied,
  markNegotiationOfferDeclined,
  saveNegotiationCartNudge,
  trackNegotiationEvent,
  type NegotiationOfferResult,
} from "@/services/negotiationService";

const DWELL_MS = 20_000;

type Props = {
  productId: number;
  productSlug: string;
  enabled: boolean;
};

function destinationFromHref(
  href: string | null,
  baseOrigin: string
): string | null {
  if (!href || href === "#" || href.startsWith("#")) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  try {
    const u = new URL(href, baseOrigin);
    if (u.origin !== baseOrigin) return null;
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

function isSameProductPath(url: string, slug: string) {
  const path = (url || "").split("?")[0].split("#")[0];
  const encoded = encodeURIComponent(slug);
  return path === `/product/${slug}` || path === `/product/${encoded}`;
}

function shouldInterceptNav(
  e: MouseEvent,
  router: NextRouter,
  anchor: HTMLAnchorElement
): boolean {
  if (e.defaultPrevented) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  if (typeof window === "undefined") return false;

  const dest = destinationFromHref(
    anchor.getAttribute("href"),
    window.location.origin
  );
  if (!dest) return false;

  const current = router.asPath.split("#")[0] || "";
  if (dest === current) return false;

  return true;
}

export default function ProductNegotiationOfferHost({
  productId,
  productSlug,
  enabled,
}: Props) {
  const router = useRouter();
  const [offer, setOffer] = useState<NegotiationOfferResult | null>(null);
  const [open, setOpen] = useState(false);
  const [soft, setSoft] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const leaveIntentRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyTrapRef = useRef(false);
  const openRef = useRef(false);
  const declinedOnceRef = useRef(false);
  const offerRef = useRef<NegotiationOfferResult | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    offerRef.current = offer;
  }, [offer]);

  const loadOffer = useCallback(
    async (opts?: {
      forLeave?: boolean;
      soft?: boolean;
    }): Promise<NegotiationOfferResult | null> => {
      if (!enabled || fetchingRef.current) return null;
      if (hasAppliedNegotiationOffer(productId)) return null;
      fetchingRef.current = true;
      setLoading(true);
      if (opts?.forLeave) setLeaving(true);
      if (opts?.soft) setSoft(true);
      const isFollowup = Boolean(opts?.soft);
      try {
        let data: NegotiationOfferResult | null = null;
        if (isFollowup) {
          try {
            data = await fetchNegotiationOffer({
              product_id: productId,
              product_slug: productSlug,
              step: "followup",
            });
          } catch {
            data = offerRef.current;
          }
        } else {
          data =
            offerRef.current ??
            (await fetchNegotiationOffer({
              product_id: productId,
              product_slug: productSlug,
              step: "first",
            }));
        }
        if (!data) {
          if (opts?.forLeave) {
            setLeaving(false);
            leaveIntentRef.current = false;
            pendingUrlRef.current = null;
          }
          setSoft(false);
          return null;
        }
        setOffer(data);
        setOpen(true);
        if (isFollowup) saveNegotiationCartNudge(data);
        trackNegotiationEvent({
          event: "shown",
          channel: isFollowup ? "banner" : "modal",
          product_id: productId,
          coupon_code: data.code,
          is_followup: isFollowup || Boolean(data.is_followup),
        });
        return data;
      } catch {
        if (opts?.forLeave) {
          setLeaving(false);
          leaveIntentRef.current = false;
          pendingUrlRef.current = null;
        }
        setSoft(false);
        return null;
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [enabled, productId, productSlug]
  );

  const scheduleSoftFollowup = useCallback(
    (delayMs: number) => {
      if (followupTimerRef.current) clearTimeout(followupTimerRef.current);
      followupTimerRef.current = setTimeout(() => {
        if (hasAppliedNegotiationOffer(productId) || openRef.current) return;
        void loadOffer({ soft: true });
      }, delayMs);
    },
    [loadOffer, productId]
  );

  const beginLeaveAttempt = useCallback(
    (dest: string | null) => {
      if (allowLeaveRef.current || declinedOnceRef.current) return false;
      if (!canShowFirstNegotiationOffer(productId)) return false;
      leaveIntentRef.current = true;
      pendingUrlRef.current = dest;
      setLeaving(true);
      if (!openRef.current) {
        void loadOffer({ forLeave: true });
      }
      return true;
    },
    [loadOffer, productId]
  );

  const onDeclined = useCallback(() => {
    declinedOnceRef.current = true;
    const current = offerRef.current;
    if (current) saveNegotiationCartNudge(current);
    trackNegotiationEvent({
      event: "declined",
      channel: soft ? "banner" : "modal",
      product_id: productId,
      coupon_code: current?.code,
      is_followup: Boolean(current?.is_followup) || soft,
    });
    const delay = markNegotiationOfferDeclined(productId);
    pendingUrlRef.current = null;
    leaveIntentRef.current = false;
    setLeaving(false);
    setOpen(false);
    setSoft(false);
    if (delay != null) scheduleSoftFollowup(delay);
  }, [productId, scheduleSoftFollowup, soft]);

  const dismissStay = useCallback(() => {
    onDeclined();
  }, [onDeclined]);

  const leaveAnyway = useCallback(() => {
    const dest = pendingUrlRef.current;
    onDeclined();
    allowLeaveRef.current = true;
    if (dest) {
      void router.push(dest);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
  }, [onDeclined, router]);

  const applyCoupon = useCallback(() => {
    if (!offer?.code) return;
    markNegotiationOfferApplied(productId);
    trackNegotiationEvent({
      event: "applied",
      channel: soft ? "banner" : "modal",
      product_id: productId,
      coupon_code: offer.code,
      is_followup: Boolean(offer.is_followup) || soft,
    });
    pendingUrlRef.current = null;
    leaveIntentRef.current = false;
    savePendingCouponCode(offer.code, {
      discount_type: offer.discount_type || "fixed",
      value: Number(offer.value) || 0,
      scope: "products",
      product_ids: offer.product_ids?.length
        ? offer.product_ids
        : [productId],
    });
    toast.success(
      `Coupon ${offer.code} applied — save ${formatCurrency(Number(offer.amount_saved) || 0)}`
    );
    setOpen(false);
    setSoft(false);
    setLeaving(false);
  }, [offer, productId, soft]);

  useEffect(() => {
    if (!enabled || !canShowFirstNegotiationOffer(productId)) return;

    dwellTimerRef.current = setTimeout(() => {
      if (!canShowFirstNegotiationOffer(productId) || openRef.current) return;
      void loadOffer();
    }, DWELL_MS);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [enabled, loadOffer, productId]);

  useEffect(() => {
    if (!enabled || !canShowFirstNegotiationOffer(productId)) return;

    const abortNav = () => {
      router.events.emit("routeChangeError");
      throw "Abort route change. Please ignore this error.";
    };

    const onRouteChangeStart = (url: string) => {
      if (allowLeaveRef.current || declinedOnceRef.current) return;
      if (isSameProductPath(url, productSlug)) return;
      if (!canShowFirstNegotiationOffer(productId)) return;

      const intercepted = beginLeaveAttempt(url);
      if (intercepted) abortNav();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (allowLeaveRef.current || openRef.current || declinedOnceRef.current) {
        return;
      }
      if (!canShowFirstNegotiationOffer(productId)) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldInterceptNav(e, router, anchor)) return;

      const dest = destinationFromHref(
        anchor.getAttribute("href"),
        window.location.origin
      );
      if (!dest || isSameProductPath(dest, productSlug)) return;

      e.preventDefault();
      e.stopPropagation();
      beginLeaveAttempt(dest);
    };

    const onPopState = () => {
      if (allowLeaveRef.current || declinedOnceRef.current) return;
      if (!canShowFirstNegotiationOffer(productId)) return;
      if (historyTrapRef.current) {
        history.pushState({ hawolaNegOffer: productId }, "");
      }
      beginLeaveAttempt(null);
    };

    if (!historyTrapRef.current && typeof window !== "undefined") {
      history.pushState({ hawolaNegOffer: productId }, "");
      historyTrapRef.current = true;
    }

    router.events.on("routeChangeStart", onRouteChangeStart);
    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      router.events.off("routeChangeStart", onRouteChangeStart);
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [beginLeaveAttempt, enabled, productId, productSlug, router]);

  useEffect(() => {
    return () => {
      if (followupTimerRef.current) clearTimeout(followupTimerRef.current);
    };
  }, []);

  if (!open && !loading) return null;

  if (!open && loading && leaving && !soft) {
    return (
      <div className="fixed inset-0 z-[10070] flex items-center justify-center bg-[#0E224D]/45 p-4 backdrop-blur-[3px]">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-lg">
          <p className="text-sm font-semibold text-[#0E224D]">
            Preparing your exclusive offer…
          </p>
        </div>
      </div>
    );
  }

  if (!open || !offer) return null;

  const saved = Number(offer.amount_saved) || 0;
  const offerPrice = Number(offer.offer_price) || 0;
  const listPrice = Number(offer.list_price) || 0;

  if (soft) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[10070] flex justify-center px-3 sm:bottom-6">
        <div
          className="pointer-events-auto w-[min(100%,24rem)] overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-12px_rgba(14,34,77,0.45)] ring-1 ring-[#0E224D]/10"
          role="status"
          aria-label={offer.headline || "Special offer"}
        >
          <div
            className="h-1 bg-gradient-to-r from-[#FD9636] via-amber-300 to-[#5BC694]"
            aria-hidden
          />
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {offer.is_followup
                  ? "We've improved your offer"
                  : "Still here?"}
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0E224D]">
                Save {formatCurrency(saved)} on this item
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatCurrency(offerPrice)} with coupon {offer.code}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss offer"
              onClick={dismissStay}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-500 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={applyCoupon}
              className="flex-1 rounded-lg bg-[#0E224D] px-3 py-2 text-xs font-bold text-white hover:bg-[#152a5c]"
            >
              Apply coupon
            </button>
            <button
              type="button"
              onClick={dismissStay}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10070] flex items-center justify-center bg-[#0E224D]/45 p-4 backdrop-blur-[3px]">
      <div
        className="pointer-events-auto relative w-[min(100vw-1.5rem,26rem)] overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_-20px_rgba(14,34,77,0.5)] ring-1 ring-[#0E224D]/10"
        role="dialog"
        aria-modal="true"
        aria-label={offer.headline || "Special offer"}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FD9636] via-amber-300 to-[#5BC694]"
          aria-hidden
        />

        <button
          type="button"
          aria-label={leaving ? "Leave this product" : "Close"}
          onClick={leaving ? leaveAnyway : dismissStay}
          className="absolute right-3 top-3 z-10 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-500 hover:bg-slate-200"
        >
          ✕
        </button>

        <div className="px-5 pb-5 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Exclusive for you
          </p>
          <h2 className="mt-2 text-[1.25rem] font-bold leading-snug text-[#0E224D]">
            {offer.headline}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{offer.subline}</p>

          <div className="mt-4 rounded-xl bg-[#FD9636]/10 px-4 py-3 text-center ring-1 ring-[#FD9636]/25">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0E224D]/60">
              Your price with coupon
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0E224D]">
              {formatCurrency(offerPrice)}
            </p>
            {listPrice > offerPrice ? (
              <p className="mt-1 text-sm text-slate-500">
                <span className="line-through">{formatCurrency(listPrice)}</span>
                <span className="ml-2 font-semibold text-emerald-700">
                  Save {formatCurrency(saved)}
                </span>
              </p>
            ) : null}
            <p className="mt-2 text-xs font-mono font-bold text-[#0E224D]/80">
              {offer.code}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={applyCoupon}
              className="flex w-full items-center justify-center rounded-xl bg-[#0E224D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#152a5c]"
            >
              Apply coupon &amp; stay
            </button>
            <button
              type="button"
              onClick={leaving ? leaveAnyway : dismissStay}
              className="flex w-full items-center justify-center rounded-xl border border-[#0E224D]/15 bg-white px-4 py-3 text-sm font-semibold text-[#0E224D] transition hover:bg-slate-50"
            >
              {leaving ? "No thanks, leave this page" : "No thanks"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
